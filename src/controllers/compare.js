import process from 'node:process';
import axios from 'axios';
import lodash from 'lodash';
import {server, rankRules} from '../config/index.js';
import validation from '../helpers/validation.js';
import * as versions from '../helpers/versions.js';
import cache from '../helpers/cache.js';

const PHONE_BASE_URL = process.env.PHONE_BASE_URL ?? 'http://localhost:' + server.port;

export default async function compare(req, res) {
	validate(req.body);

	const ranking = req.body.ranking;
	const phoneScoreList = await getPhoneScoreList(req.body.phones);
	const rankScale = await generateScoreScale(ranking, phoneScoreList);
	await scoreAndSortPhones(phoneScoreList, rankScale);
	res.set('cache-control', 'public, max-age=2419200').send({
		best: phoneScoreList[0],
		results: phoneScoreList,
	});
}

async function scoreAndSortPhones(phoneScoreList, rankScale) {
	const promises = [];
	for (const phoneScore of phoneScoreList) {
		promises.push(getFinalScore(rankScale, phoneScore));
	}

	await Promise.all(promises);

	phoneScoreList.sort((alpha, beta) => beta.score - alpha.score);
}

function validate(body) {
	validation(body, {
		phones: {presence: false, type: 'array'},
		ranking: {presence: true, type: 'array'},
	});
	if (body.phones) {
		for (const item of body.phones) {
			validation(item, {
				manufacturer: {presence: true, type: 'string'},
				model: {presence: true, type: 'string'},
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
					inclusion: Object.keys(rankRules),
				},
			},
		);
	}
}

async function getPhoneScoreList(phones) {
	let phoneList = phones;
	if (!phoneList) {
		phoneList = cache.get('/v1/phones');
		if (!phoneList) {
			const res = await axios.get(PHONE_BASE_URL + '/v1/phones');
			phoneList = res.data;
			const ttl = res.headers['cache-control'] ? res.headers['cache-control'].match(/max-age=(\d+)/i)[1] : 600;
			cache.set('/v1/phones', phoneList, ttl);
		}
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
		scales[rank] = initScoreScaleForRank(rank, rankRules[rank], phoneScoreList);
	}

	let i = rankList.length;
	for (const rank of rankList) {
		populateScoreScaleForRank(scales[rank], 2 ** i--, rankRules[rank]);
	}

	return scales;
}

async function getPhoneScore(phone) {
	const url =
		'/v1/phones/' +
		(phone.href ?? 'manufacturers/' + phone.manufacturer.toLowerCase() + '/models/' + phone.model.toLowerCase());
	let data = cache.get(url);
	if (!data) {
		const res = await axios.get(PHONE_BASE_URL + url);
		data = res.data;
		const ttl = res.headers['cache-control'] ? res.headers['cache-control'].match(/max-age=(\d+)/i)[1] : 600;
		cache.set(url, data, ttl);
	}

	return {href: url, phone: data};
}

function scoreNumber(value, rankRule, rankScale) {
	if (rankRule.scoreMethod === 'PREFER_LOW') {
		return (rankScale.values.max - value) * rankScale.multiplier;
	}

	if (rankRule.scoreMethod === 'PREFER_HIGH') {
		return (value - rankScale.values.min) * rankScale.multiplier;
	}

	return 0;
}

function scoreBoolean(value, rankRule, rankScale) {
	if (value && rankRule.scoreMethod === 'PREFER_TRUE') {
		return rankScale.multiplier;
	}

	return 0;
}

function scoreVersion(value, rankRule, rankScale) {
	const version = versions.getVersionObject(value);
	const semantic = rankScale.semantic;
	if (version[semantic] && rankRule.scoreMethod === 'PREFER_HIGH') {
		return (version[semantic] - rankScale[semantic].min) * rankScale.multiplier;
	}

	return 0;
}

async function getFinalScore(rankScale, phoneScore) {
	phoneScore.scoreBreakdown = {};
	phoneScore.score = 0;
	for (const rank in rankScale) {
		const value = lodash.get(phoneScore.phone, rank);
		let score = 0;
		switch (rankRules[rank].type) {
			case 'number':
				score = scoreNumber(value, rankRules[rank], rankScale[rank]);
				break;

			case 'boolean':
				score = scoreBoolean(value, rankRules[rank], rankScale[rank]);
				break;

			case 'version':
				score = scoreVersion(value, rankRules[rank], rankScale[rank]);
				break;

			default:
				console.error('Invalid type configured: rank=', rank, 'type=', rankRules[rank].type);
		}

		phoneScore.scoreBreakdown[rank] = score;
		phoneScore.score += score;
	}

	delete phoneScore.phone;
}

function initScoreScaleForRank(rank, rankRule, phoneScoreList) {
	const result = {};
	const mapValues = {};
	switch (rankRule.type) {
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
			return result;
	}

	for (const phoneScore of phoneScoreList) {
		const value = lodash.get(phoneScore.phone, rank);

		if (value) {
			let version;
			switch (rankRule.type) {
				case 'number':
					mapValues.values.push(value);
					break;
				case 'version':
					version = versions.getVersionObject(value);
					if (version?.major) mapValues.major.push(version.major);
					if (version?.minor) mapValues.minor.push(version.minor);
					if (version?.patch) mapValues.patch.push(version.patch);
					break;
				default:
				// Should never get here
			}
		}
	}

	for (const item of Object.keys(mapValues)) {
		result[item] = {};
		result[item].max = Math.max(...mapValues[item]);
		result[item].min = Math.min(...mapValues[item]);
	}

	return result;
}

function populateScoreScaleForRank(scoreScale, maxPoints, rankRule) {
	let temporarySemantic;
	let semantic = 'major';
	switch (rankRule.type) {
		case 'number':
			scoreScale.multiplier = maxPoints / (scoreScale.values.max - scoreScale.values.min);
			break;
		case 'version':
			for (temporarySemantic of ['major', 'minor', 'patch']) {
				if (scoreScale[temporarySemantic]?.max !== scoreScale[temporarySemantic]?.min) {
					semantic = temporarySemantic;
					break;
				}
			}

			scoreScale.semantic = semantic;
			scoreScale.multiplier = maxPoints / (scoreScale[semantic].max - scoreScale[semantic].min);
			break;
		default:
			scoreScale.multiplier = maxPoints;
	}
}
