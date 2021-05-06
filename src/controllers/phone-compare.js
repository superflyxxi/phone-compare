const {server, rankRules} = require('../config');
const PHONE_BASE_URL = process.env.PHONE_BASE_URL ?? 'http://localhost:' + server.port;
const validator = require('../helpers/validation');
const axios = require('axios');
const lodash = require('lodash');

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
					inclusion: ['dimensions.height', 'dimensions.weight', 'dimensions.width', 'nfc', 'sensors.fingerprint']
				}
			}
		);
	}
}

exports.comparePhones = async function (req, res) {
	validate(req.body);

	const ranking = req.body.ranking;
	const phoneList = await getPhoneList(req.body.phones, ranking);
	const rankScale = await generateScoreScale(ranking, phoneList);

	const promises = [];
	for (const phone of phoneList) {
		promises.push(scorePhone(rankScale, phone));
	}

	await Promise.all(promises);

	phoneList.sort((alpha, beta) => {
		return beta.score - alpha.score;
	});
	res.set('cache-control', 'public, max-age=2419200').send({
		best: phoneList[0],
		results: phoneList
	});
};

async function getPhoneList(phones, ranking) {
	let phoneList = phones;
	if (!phoneList) {
		const res = await axios.get(PHONE_BASE_URL + '/v1/phones');
		phoneList = res.data;
	}

	const promises = [];
	for (const phone of phoneList) {
		promises.push(getPhoneData(phone, ranking));
	}

	return Promise.all(promises);
}

/**
 * Generates an object that describes how each ranked property should be scored on a scale.
 * For example, if the min height in the phone list is 130 and the max height is 150, then for
 * each mm, it would be equal to X points. If the min height is 140 and the max is 145, then
 * each mm is worth Y points, where Y > X.
 */
async function generateScoreScale(rankList, phoneList) {
	const scales = {};
	for (const phone of phoneList) {
		for (const rank of rankList) {
			const value = lodash.get(phone, rank);
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

async function getPhoneData(phone, properties) {
	const url =
		PHONE_BASE_URL +
		(phone.href ? phone.href : '/v1/phones/manufacturers/' + phone.manufacturer + '/models/' + phone.model);
	const res = await axios.get(url);
	const data = {
		manufacturer: res.data.manufacturer,
		model: res.data.model,
		name: res.data.name
	};
	for (const property of properties) {
		lodash.set(data, property, lodash.get(res.data, property));
	}

	return data;
}

async function scorePhone(rankScale, phone) {
	phone.scoreBreakdown = {};
	phone.score = 0;
	for (const rank in rankScale) {
		const value = lodash.get(phone, rank);
		let score = 0;
		if (rankRules[rank].type === 'number') {
			if (rankRules[rank].scoreMethod === 'FROM_MAX') {
				score = (rankScale[rank].max - value) * rankScale[rank].multiplier;
			}
		} else if (rankRules[rank].type === 'boolean' && value && rankRules[rank].scoreMethod === 'PREFER_TRUE') {
			score = rankScale[rank].multiplier;
		}

		phone.scoreBreakdown[rank] = score;
	}

	for (const item in phone.scoreBreakdown) {
		phone.score += phone.scoreBreakdown[item];
	}
}
