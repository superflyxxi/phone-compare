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
		if (!rankRules[item]) {
			console.error(item, 'has not been configured properly');
		}

		validator.validate(
			{item},
			{
				item: {
					presence: true,
					type: 'string',
					inclusion: [
						'dimensions.height',
						'dimensions.depth',
						'dimensions.width',
						'nfc',
						'sensors.fingerprint',
						'ram',
						'year',
						'price.usd',
						'price.eur'
					]
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

/**
 * Generates an object that describes how each ranked property should be scored on a scale.
 * For example, if the min height in the phone list is 130 and the max height is 150, then for
 * each mm, it would be equal to X points. If the min height is 140 and the max is 145, then
 * each mm is worth Y points, where Y > X.
 */
async function generateScoreScale(rankList, phoneScoreList) {
	const scales = {};
	for (const phoneScore of phoneScoreList) {
		for (const rank of rankList) {
			const value = lodash.get(phoneScore.phone, rank);
			if (!scales[rank]) {
				scales[rank] = {};
			}

			if (rankRules[rank].type === 'number') {
				if (!scales[rank].min || scales[rank].min > value) {
					scales[rank].min = value;
				}

				if (!scales[rank].max || scales[rank].max < value) {
					scales[rank].max = value;
				}
			}
		}
	}

	let index = rankList.length;
	for (const rank of rankList) {
		const maxPoints = 2 ** index;
		if (rankRules[rank].type === 'number') {
			scales[rank].multiplier = maxPoints / (scales[rank].max - scales[rank].min);
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
				score = (rankScale[rank].max - value) * rankScale[rank].multiplier;
			} else if (rankRules[rank].scoreMethod === 'PREFER_HIGH') {
				score = (value - rankScale[rank].min) * rankScale[rank].multiplier;
			}
		} else if (rankRules[rank].type === 'boolean' && value && rankRules[rank].scoreMethod === 'PREFER_TRUE') {
			score = rankScale[rank].multiplier;
		}

		phoneScore.scoreBreakdown[rank] = score;
	}

	for (const item in phoneScore.scoreBreakdown) {
		phoneScore.score += phoneScore.scoreBreakdown[item];
	}

	delete phoneScore.phone;
}
