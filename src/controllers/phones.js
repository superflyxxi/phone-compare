const model = require('../models/phones');
const NotFoundError = require('../error-handler/not-found-error.js');

exports.getAllPhones = async function (req, res) {
	const phoneList = await model.getAllPhones();
	res.set('cache-control', 'public, max-age=2419200').send(phoneList);
};

exports.getPhoneByManufacturerAndModel = async function (req, res) {
	const phone = await model.getPhone(req.params.manufacturer, req.params.model);
	if (phone) {
		res.set('cache-control', 'public, max-age=2419200').send(phone);
	} else {
		throw new NotFoundError(
			`${req.params.manufacturer}/${req.params.model} not found.`
		);
	}
};

exports.savePhoneByManufacturerAndModel = async function (req, res) {
	const phone = req.body;
	phone.manufacturer = req.params.manufacturer;
	phone.model = req.params.model;
	await model.savePhone(phone);
	res.status(204).send();
};
