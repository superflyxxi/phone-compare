const {server, rankRules} = require('../config');
const PHONE_BASE_URL = process.env.PHONE_BASE_URL ?? 'http://localhost:' + server.port;
const validator = require('../helpers/validation');
const axios = require('axios');
const lodash = require('lodash');

exports.comparePhones = async function (req, res) {
	validate(req.body);

	const ranking = req.body.ranking;
	const phoneScoreList = await getPhoneScoreList(req.body.phones);
	const rankScale = await generateScoreScale(ranking, phoneScoreList);
	await scoreAndSortPhones(phoneScoreList, rankScale);
	res.set('cache-control', 'public, max-age=2419200').send({
		best: phoneScoreList[0],
		results: phoneScoreList
	});
};

async function scoreAndSortPhones(phoneScoreList, rankScale) {
	const promises = [];
	for (const phoneScore of phoneScoreList) {
		promises.push(score(rankScale, phoneScore));
	}

	await Promise.all(promises);

	phoneScoreList.sort((alpha, beta) => {
		return beta.score - alpha.score;
	});
}

function validate(body) {
	validator.validate(body, {
		phones: {presence: false, type: 'array'},
		ranking: {presence: true, type: 'array'}
	});
	if (body.phones) {
		for (const item of body.phones) {
			validator.validate(item, {
				manufacturer: {presence: true, type: 'string'},
				model: {presence: true, type: 'string'}
			});
		}
	}

	for (const item of body.ranking) {
		validator.validate(
			{item},
			{
				item: {
					presence: true,
					type: 'string',
					inclusion: Object.keys(rankRules)
				}
			}
		);
	}
}

async function getPhoneScoreList(phones) {
	let phoneList = phones;
	if (!phoneList) {
		const res = await axios.get(PHONE_BASE_URL + '/v1/phones');
		phoneList = res.data;
	}

	const promises = [];
	for (const phone of phoneList) {
		promises.push(getPhoneScore(phone));
	}

	return Promise.all(promises);
}

function getVersion(string) {
	const splt = string.split('.');
	return {
		major: splt[0] ? Number.parseInt(splt[0], 10) : undefined,
		minor: splt[1] ? Number.parseInt(splt[1], 10) : undefined,
		patch: splt[2] ? Number.parseInt(splt[2], 10) : undefined
	};
}

/**
 * Generates an object that describes how each ranked property should be scored on a scale.
 * For example, if the min height in the phone list is 130 and the max height is 150, then for
 * each mm, it would be equal to X points. If the min height is 140 and the max is 145, then
 * each mm is worth Y points, where Y > X.
 */
async function generateScoreScale(rankList, phoneScoreList) {
	const scales = {};

	for (const rank of rankList) {
		scales[rank] = {};
		const mapValues = {};
		switch (rankRules[rank].type) {
			case 'number':
				mapValues.values = [];
				break;
			case 'version':
				mapValues.major = [];
				mapValues.minor = [];
				mapValues.patch = [];
				break;
			default:
				// Skip any types that don't need counting
				continue;
		}

		for (const phoneScore of phoneScoreList) {
			const value = lodash.get(phoneScore.phone, rank);

			if (value) {
				let version;
				switch (rankRules[rank].type) {
					case 'number':
						mapValues.values.push(value);
						break;
					case 'version':
						version = getVersion(value);
						mapValues.major.push(version.major);
						mapValues.minor.push(version.minor);
						mapValues.patch.push(version.patch);
						break;
					default:
					// Should never get here
				}
			}
		}

		for (const item of Object.keys(mapValues)) {
			scales[rank][item] = {};
			scales[rank][item].max = Math.max(...mapValues[item]);
			scales[rank][item].min = Math.min(...mapValues[item]);
		}
	}

	let index = rankList.length;
	for (const rank of rankList) {
		const maxPoints = 2 ** index;
		let i;
		let semantic = 'major';
		switch (rankRules[rank].type) {
			case 'number':
				scales[rank].multiplier = maxPoints / (scales[rank].values.max - scales[rank].values.min);
				break;
			case 'version':
				for (i of ['major', 'minor', 'patch']) {
					if (scales[rank][i].max !== scales[rank][i].min) {
						semantic = i;
						break;
					}
				}

				scales[rank].semantic = semantic;
				scales[rank].multiplier = maxPoints / (scales[rank][semantic].max - scales[rank][semantic].min);
				break;
			default:
				scales[rank].multiplier = maxPoints;
		}

		index--;
	}

	return scales;
}

async function getPhoneScore(phone) {
	const url = '/v1/phones/' + (phone.href ?? 'manufacturers/' + phone.manufacturer + '/models/' + phone.model);
	const res = await axios.get(PHONE_BASE_URL + url);
	return {href: url, phone: res.data};
}

async function score(rankScale, phoneScore) {
	phoneScore.scoreBreakdown = {};
	phoneScore.score = 0;
	for (const rank in rankScale) {
		const value = lodash.get(phoneScore.phone, rank);
		let score = 0;
		let version;
		let semantic;
		switch (rankRules[rank].type) {
			case 'number':
				if (rankRules[rank].scoreMethod === 'PREFER_LOW') {
					score = (rankScale[rank].values.max - value) * rankScale[rank].multiplier;
				} else if (rankRules[rank].scoreMethod === 'PREFER_HIGH') {
					score = (value - rankScale[rank].values.min) * rankScale[rank].multiplier;
				}

				break;

			case 'boolean':
				if (value && rankRules[rank].scoreMethod === 'PREFER_TRUE') {
					score = rankScale[rank].multiplier;
				}

				break;

			case 'version':
				version = getVersion(value);
				semantic = rankScale[rank].semantic;
				if (rankRules[rank].scoreMethod === 'PREFER_HIGH') {
					score = (version[semantic] - rankScale[rank][semantic].min) * rankScale[rank].multiplier;
				}

				break;

			default:
				console.error('Invalid type configured: rank=', rank, 'type=', rankRules[rank].type);
		}

		phoneScore.scoreBreakdown[rank] = score;
	}

	for (const item in phoneScore.scoreBreakdown) {
		phoneScore.score += phoneScore.scoreBreakdown[item];
	}

	delete phoneScore.phone;
}
