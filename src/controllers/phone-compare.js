/* eslint-disable no-unused-vars */
const PHONE_BASE_URL = process.env.PHONE_BASE_URL ?? '';
const validator = require('../helpers/validation');
const validationConstraints = {
	phones: {
		presence: true,
		type: 'array'
	},
	ranking: {
		presence: true,
		type: 'array'
	}
};

function validate(body) {
	validator.validate(body, validationConstraints);
	body.phones.every((item) =>
		validator.validate(item, {
			manufacturer: {presence: true, type: 'string'},
			model: {presence: true, type: 'string'}
		})
	);
	/* Body.ranking.every((item) =>
		validator.validate(item, {
			presence: true,
			type: 'string'
		})
	); */
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
async function generateScoreScale(rank, phones) {
	return {};
}

async function getPhoneData(phone, properties) {
	const data = {
		manufacturer: phone.manufacturer,
		model: phone.model
	};
	for (const property of properties) {
		data[property] = phone[property];
	}

	return phone;
}

async function scorePhone(rankScale, phone) {
	phone.score = 0;
	phone.scoreBreakdown = {};
}

async function getSortedPhoneList(phones) {
	return phones;
}
