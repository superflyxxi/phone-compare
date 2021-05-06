const {server, rankRules} = require('../config');
const PHONE_BASE_URL = process.env.PHONE_BASE_URL ?? 'http://localhost:' + server.port;
const validator = require('../helpers/validation');
const axios = require('axios');
const lodash = require('lodash');

const validationConstraints = {
	phones: {presence: true, type: 'array'},
	ranking: {presence: true, type: 'array'}
};

function validate(body) {
	validator.validate(body, validationConstraints);
	body.phones.every((item) =>
		validator.validate(item, {
			manufacturer: {presence: true, type: 'string'},
			model: {presence: true, type: 'string'}
		})
	);
	body.ranking.every((item) => validator.validate({item}, {item: {presence: true, type: 'string'}}));
}

exports.comparePhones = async function (req, res) {
	validate(req.body);
	let promises = [];
	const rank = req.body.ranking;
	for (const phone of req.body.phones) {
		promises.push(getPhoneData(phone, rank));
	}

	const phoneList = await Promise.all(promises);
	console.log('initial', phoneList);

	const rankScale = await generateScoreScale(rank, phoneList);

	promises = [];
	for (const phone of phoneList) {
		promises.push(scorePhone(rankScale, phone));
	}

	await Promise.all(promises);
	console.log('scored', phoneList);

	phoneList.sort((alpha, beta) => {
		return beta.score - alpha.score;
	});
	console.log('sorted', phoneList);
	res.set('cache-control', 'public, max-age=2419200').send({
		best: phoneList[0],
		results: phoneList
	});
};

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
				scales[rank] = {max: 0, min: Number.MAX_VALUE};
			}

			if (scales[rank].min > value) {
				scales[rank].min = value;
			}

			if (scales[rank]?.max < value) {
				scales[rank].max = value;
			}
		}
	}

	const index = rankList.length;
	for (const rank of rankList) {
		scales[rank].multiplierPerUnit = 2 ** index / (scales[rank].max - scales[rank].min);
	}

	console.log('scales', scales);
	return scales;
}

async function getPhoneData(phone, properties) {
	const url = PHONE_BASE_URL + '/v1/phones/manufacturers/' + phone.manufacturer + '/models/' + phone.model;
	const res = await axios.get(url);
	const data = {
		manufacturer: res.data.manufacturer,
		model: res.data.model,
		name: res.data.name
	};
	for (const property of properties) {
		console.log('Processing', res.data.manufacturer, res.data.model, 'for property', property);
		lodash.set(data, property, lodash.get(res.data, property));
	}

	return data;
}

async function scorePhone(rankScale, phone) {
	phone.scoreBreakdown = {};
	phone.score = 0;
	for (const rank in rankScale) {
		const value = lodash.get(phone, rank);
		if (rankRules[rank].type === 'number') {
			let score = 0;
			if (rankRules[rank].scoreMethod === 'FROM_MAX') {
				score = (rankScale[rank].max - value) * rankScale[rank].multiplierPerUnit;
			}

			phone.scoreBreakdown[rank] = Math.round(score / rankRules[rank].precision) * rankRules[rank].precision;
		}
	}

	for (const item in phone.scoreBreakdown) {
		phone.score += phone.scoreBreakdown[item];
	}
}
