import axios from 'axios';
import lodash from 'lodash';
import {server, rankRules} from '../config/index.js';
import validation from '../helpers/validation.js';
import * as versions from '../helpers/versions.js';

const PHONE_BASE_URL = process.env.PHONE_BASE_URL ?? 'http://localhost:' + server.port;

export default async function comparePhones(req, res) {
	validate(req.body);

	const ranking = req.body.ranking;
	const phoneScoreList = await getPhoneScoreList(req.body.phones);
	const rankScale = await generateScoreScale(ranking, phoneScoreList);
	await scoreAndSortPhones(phoneScoreList, rankScale);
	res.set('cache-control', 'public, max-age=2419200').send({
		best: phoneScoreList[0],
		results: phoneScoreList
	});
}

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
	validation(body, {
		phones: {presence: false, type: 'array'},
		ranking: {presence: true, type: 'array'}
	});
	if (body.phones) {
		for (const item of body.phones) {
			validation(item, {
				manufacturer: {presence: true, type: 'string'},
				model: {presence: true, type: 'string'}
			});
		}
	}

	for (const item of body.ranking) {
		validation(
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
						version = versions.getVersionObject(value);
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

	let i = rankList.length;
	for (const rank of rankList) {
		const maxPoints = 2 ** i;
		let temporarySemantic;
		let semantic = 'major';
		switch (rankRules[rank].type) {
			case 'number':
				scales[rank].multiplier = maxPoints / (scales[rank].values.max - scales[rank].values.min);
				break;
			case 'version':
				for (temporarySemantic of ['major', 'minor', 'patch']) {
					if (scales[rank][temporarySemantic].max !== scales[rank][temporarySemantic].min) {
						semantic = temporarySemantic;
						break;
					}
				}

				scales[rank].semantic = semantic;
				scales[rank].multiplier = maxPoints / (scales[rank][semantic].max - scales[rank][semantic].min);
				break;
			default:
				scales[rank].multiplier = maxPoints;
		}

		i--;
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
				version = versions.getVersionObject(value);
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
