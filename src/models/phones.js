const NotFoundError = require('../error-handler/not-found-error.js');
const rootDirectory = process.env.DATA_DIR ?? `${process.env.HOME}/data`;
const fs = require('fs/promises');
const path = require('path');

exports.getAllPhones = async function () {
	const result = [];
	for (const filename of await fs.readdir(rootDirectory)) {
		const splt = filename.split('.');
		result.push({
			href: path.join('/manufacturers/', splt[0], '/models/', splt[1])
		});
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
			await fs.readFile(`${rootDirectory}/${manufacturer}.${model}.json`)
		);
	} catch (error) {
		throw new NotFoundError(error.message);
	}

	Object.assign(
		phone,
		await require('../helpers/gsm-arena.js').getGsmArenaData(phone.gsmArenaUrl)
	);
	return phone;
};

exports.savePhone = async function (phone) {
	require('../helpers/validation').validate(phone, validationConstraints);
	const manufacturer = phone.manufacturer;
	const model = phone.model;
	await fs.writeFile(
		`${rootDirectory}/${manufacturer}.${model}.json`,
		JSON.stringify(phone)
	);
};