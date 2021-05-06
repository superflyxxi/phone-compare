/* eslint-disable no-unused-vars */
const PHONE_BASE_URL = process.env.PHONE_BASE_URL ?? 'http://localhost:3000';
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
	body.ranking.every((item) =>
		validator.validate({item}, {item: {presence: true, type: 'string'}})
	);
}

const rankRules = {
	'dimensions.height': {
		scoreNumber: 'FROM_MAX'
	}
};

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

	const sortedPhoneList = await getSortedPhoneList(phoneList);
	console.log('sorted', sortedPhoneList);
	res.set('cache-control', 'public, max-age=2419200').send({
		best: sortedPhoneList[0],
		results: sortedPhoneList
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
			const val = lodash.get(phone, rank);
			if (!scales[rank]) {
				scales[rank] = {max:0, min:Number.MAX_VALUE};
			}
			if (scales[rank].min > val) {
				scales[rank].min = val;
			}
			if (scales[rank]?.max < val) {
				scales[rank].max = val;
			}
		}
	}
	let i=rankList.length;
	for (const rank of rankList) {
		scales[rank].multiplierPerUnit = Math.pow(2, i) / (scales[rank].max - scales[rank].min);
	}
	console.log('scales', scales);
	return scales;
}

async function getPhoneData(phone, properties) {
	const url =
		PHONE_BASE_URL +
		'/v1/phones/manufacturers/' +
		phone.manufacturer +
		'/models/' +
		phone.model;
	const res = await axios.get(url);
	const data = {
		manufacturer: res.data.manufacturer,
		model: res.data.model,
		name: res.data.name
	};
	for (const property of properties) {
		console.log("Processing ", res.data.manufacturer, res.data.model, "for property", property);
		lodash.set(data, property, lodash.get(res.data, property));
	}

	return data;
}

async function scorePhone(rankScale, phone) {
	phone.scoreBreakdown = {};
	phone.score = 0;
	for (const rank in rankScale) {
		const val = lodash.get(phone, rank);
		if (rankRules[rank].scoreNumber === 'FROM_MAX') {
			phone.scoreBreakdown[rank] = (rankScale[rank].max - val)*rankScale[rank].multiplierPerUnit;
		}
	}
	for (const breakdown in phone.scoreBreakdown) {
		phone.score += phone.scoreBreakdown[breakdown];
	}
}

async function getSortedPhoneList(phones) {
	return phones;
}
