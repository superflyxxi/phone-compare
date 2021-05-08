const NotFoundError = require('../error-handler/not-found-error.js');
const rootDirectory = process.env.DATA_DIR ?? `${process.env.HOME}/data`;
const fs = require('fs/promises');
const path = require('path');
const versions = require('../helpers/versions');

exports.getAllPhones = async function () {
	const result = [];
	for (const filename of await fs.readdir(rootDirectory)) {
		const splt = filename.split('.');
		result.push({href: 'manufacturers/' + splt[0] + '/models/' + splt[1]});
	}

	return result;
};

const validationConstraints = {
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
		presence: true,
		type: 'string'
	}
};

exports.getPhone = async function (manufacturer, model) {
	let phone;
	try {
		phone = JSON.parse(
			await fs.readFile(path.join(rootDirectory, manufacturer.toLowerCase() + '.' + model.toLowerCase() + '.json'))
		);
	} catch (error) {
		throw new NotFoundError(error.message);
	}

	Object.assign(phone, await require('../helpers/gsm-arena.js').getGsmArenaData(phone.gsmArenaUrl));
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
};

exports.savePhone = async function (phone) {
	require('../helpers/validation').validate(phone, validationConstraints);
	const manufacturer = phone.manufacturer;
	const model = phone.model;
	await fs.writeFile(
		path.join(rootDirectory, manufacturer.toLowerCase() + '.' + model.toLowerCase() + '.json'),
		JSON.stringify(phone)
	);
};
