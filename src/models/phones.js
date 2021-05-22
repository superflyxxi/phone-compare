import fs from 'node:fs/promises';
import path from 'node:path';
import NotFoundError from '../error-handler/not-found-error.js';
import * as versions from '../helpers/versions.js';
import getGsmArenaData from '../helpers/gsm-arena.js';
import validation from '../helpers/validation.js';

const DATA_DIRECTORY = process.env.DATA_DIR ?? `${process.env.HOME}/data`;

async function getAllPhones() {
	const result = [];
	for (const filename of await fs.readdir(DATA_DIRECTORY)) {
		const splt = filename.split('.');
		result.push({href: 'manufacturers/' + splt[0] + '/models/' + splt[1]});
	}

	return result;
}

async function getPhone(manufacturer, model) {
	let phone;
	try {
		phone = JSON.parse(
			await fs.readFile(path.join(DATA_DIRECTORY, manufacturer.toLowerCase() + '.' + model.toLowerCase() + '.json'))
		);
	} catch (error) {
		throw new NotFoundError(error.message);
	}

	Object.assign(phone, await getGsmArenaData(phone.gsmArenaUrl));
	const lineageVersion = versions.getAndroidVersion(phone.lineageos);
	phone.android.lineageos = versions.getVersionString(lineageVersion);
	const androidVersion = versions.getVersionObject(phone.android.official);
	const maxVersion = {};
	if (lineageVersion.major === androidVersion.major) {
		maxVersion.major = androidVersion.major;
		if (lineageVersion.minor === androidVersion.minor) {
			maxVersion.minor = androidVersion.minor;
			maxVersion.patch = Math.max(androidVersion.patch, lineageVersion.patch);
		} else {
			maxVersion.minor = Math.max(androidVersion.minor, lineageVersion.minor);
		}
	} else {
		maxVersion.major = Math.max(androidVersion.major, lineageVersion.major);
	}

	phone.android.max = versions.getVersionString(maxVersion);
	return phone;
}

async function savePhone(phone) {
	validate(phone);
	const manufacturer = phone.manufacturer;
	const model = phone.model;
	await fs.writeFile(
		path.join(DATA_DIRECTORY, manufacturer.toLowerCase() + '.' + model.toLowerCase() + '.json'),
		JSON.stringify(phone)
	);
}

function validate(phone) {
	validation(phone, {
		manufacturer: {
			presence: true,
			type: 'string'
		},
		model: {
			presence: true,
			type: 'string'
		},
		gsmArenaUrl: {
			presence: true,
			url: true
		},
		lineageos: {
			presence: false,
			type: 'string'
		}
	});
}

export {getPhone, getAllPhones, savePhone};
