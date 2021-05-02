
/*
 * Phone = {
 * manufacturer
 * model
 * gsmarenaUrl
 * height
 * fingerprint
 * qi
 * nfc
 * lineageOSVersion
 */
const NotFoundError = require('../error-handler/not-found-error.js');
const rootDir = process.env.DATA_DIR ?? '/data/';
const fs = require('fs/promises');

exports.getPhone = async function (manufacturer, model) {
	try {
		const phone = JSON.parse(await fs.readFile(`${rootDir}${manufacturer}-${model}.json`));
		phone.gsmArena = await require('../helpers/gsm-arena.js').getGsmArenaData(phone.gsmArenaUrl);
		return phone;
	} catch (err) {
		throw new NotFoundError(err.message);
	}
};

exports.savePhone = async function (manufacturer, model, phone) {
	await fs.writeFile(phone, `${rootDir}${manufacturer}-${model}.json`);
}
