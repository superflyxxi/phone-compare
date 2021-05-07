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
		if (rankRules[rank].type === 'number') {
			mapValues.values = [];
		} else if (rankRules[rank].type === 'version') {
			mapValues.major = [];
			mapValues.minor = [];
			mapValues.patch = [];
		}

		for (const phoneScore of phoneScoreList) {
			const value = lodash.get(phoneScore.phone, rank);

			if (rankRules[rank].type === 'number') {
				mapValues.values.push(value);
			} else if (rankRules[rank].type === 'version') {
				const version = getVersion(value);
				mapValues.major.push(version.major);
				mapValues.minor.push(version.minor);
				mapValues.patch.push(version.patch);
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
		if (rankRules[rank].type === 'number') {
			scales[rank].multiplier = maxPoints / (scales[rank].values.max - scales[rank].values.min);
		} else if (rankRules[rank].type === 'version') {
			for (const v of ['major', 'minor', 'patch']) {
				if (scales[rank][v].max !== scales[rank][v].min) {
					scales[rank].semantic = v;
					break;
				}
			}

			scales[rank].multiplier =
				maxPoints / (scales[rank][scales[rank].semantic].max - scales[rank][scales[rank].semantic].min);
		} else {
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
		if (rankRules[rank].type === 'number') {
			if (rankRules[rank].scoreMethod === 'PREFER_LOW') {
				score = (rankScale[rank].values.max - value) * rankScale[rank].multiplier;
			} else if (rankRules[rank].scoreMethod === 'PREFER_HIGH') {
				score = (value - rankScale[rank].values.min) * rankScale[rank].multiplier;
			}
		} else if (rankRules[rank].type === 'boolean' && value && rankRules[rank].scoreMethod === 'PREFER_TRUE') {
			score = rankScale[rank].multiplier;
		} else if (rankRules[rank].type === 'version') {
			const version = getVersion(value);
			const semantic = rankScale[rank].semantic;
			console.log('ver=', version, 'semantic=', semantic);
			if (rankRules[rank].scoreMethod === 'PREFER_HIGH') {
				score = (version[semantic] - rankScale[rank][semantic].min) * rankScale[rank].multiplier;
			}
		}

		phoneScore.scoreBreakdown[rank] = score;
	}

	for (const item in phoneScore.scoreBreakdown) {
		phoneScore.score += phoneScore.scoreBreakdown[item];
	}

	delete phoneScore.phone;
}
