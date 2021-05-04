const NotFoundError = require('../error-handler/not-found-error.js');
const MissingMandatoryParametersError = require('../error-handler/missing-mandatory-parameters-error.js');
const rootDirectory = process.env.DATA_DIR ?? `${process.env.HOME}/data`;
const fs = require('fs/promises');

exports.getAllPhones = async function () {
	let result = [];
	for (const filename of await fs.readdir(rootDirectory)) {
		const splt = filename.split('.');
		result.push(this.getPhone(splt[0], splt[1]));
	}

	result = await Promise.all(result);
	return result;
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
	const manufacturer = phone.manufacturer;
	const model = phone.model;
	if (phone.gsmArenaUrl && phone.lineageos) {
		await fs.writeFile(
			`${rootDirectory}/${manufacturer}.${model}.json`,
			JSON.stringify(phone)
		);
	} else {
		throw new MissingMandatoryParametersError({
			gsmArenaUrl: phone.gsmArenaUrl,
			lineageos: phone.lineageos
		});
	}
};
