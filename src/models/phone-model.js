const NotFoundError = require('../error-handler/not-found-error.js');
const MissingMandatoryParametersError = require('../error-handler/missing-mandatory-parameters-error.js');
const rootDirectory = process.env.DATA_DIR ?? `${process.env.HOME}/data/`;
const fs = require('fs/promises');
const {validate} = require('../helpers/validation');

exports.getPhone = async function (manufacturer, model) {
	let phone;
	try {
		phone = JSON.parse(
			await fs.readFile(`${rootDirectory}${manufacturer}-${model}.json`)
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

const validationConstraints = {
	manufacturer: {
		presence: true
	},
	model: {
		presence: true
	},
	gsmArenaUrl: {
		presence: true
	},
	lineageos: {
		presence: true
	}
};

exports.savePhone = async function (phone) {
	validate(phone, validationConstraints);
	const manufacturer = phone.manufacturer;
	const model = phone.model;
	await fs.writeFile(
		`${rootDirectory}${manufacturer}-${model}.json`,
		JSON.stringify(phone)
	);
};
