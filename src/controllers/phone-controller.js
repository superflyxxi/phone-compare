const model = require('../models/phone-model.js');
const NotFoundError = require('../error-handler/not-found-error.js');

exports.getPhoneByManufacturerAndModel = async function (req, res) {
	if (req.get('etag')) {
		res.status(304).send();
	} else {
		const phone = await model.getPhone(req.params.manufacturer, req.params.model);
		if (phone) {
			res
				.set('cache-control', 'public, max-age=2419200')
				.status(200)
				.send(phone);
		} else {
			throw new NotFoundError(
				`${req.params.manufacturer}/${req.params.model} not found.`
			);
		}
	}
};

exports.savePhoneByManufacturerAndModel = async function (req, res) {
	const phone = req.body;
	phone.manufacturer = req.params.manufacturer;
	phone.model = req.params.model;
	await model.savePhone(phone)
	res
		.status(204).send();
};
