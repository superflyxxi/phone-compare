const model = require('../models/phone-model.js');
const NotFoundError = require('../error-handler/not-found-error.js');

exports.getPhoneByManufacturerAndModel = function (req, res, next) {
	if (req.get('etag')) {
		res.status(304).send();
	} else {
		const phone = model.getPhone(req.params.manufacturer, req.params.model);
		if (phone) {
			res
				.set('cache-control', 'public, max-age=2419200')
				.status(200)
				.send(phone);
		} else {
			throw new NotFoundError(`${req.params.manufacturer}/${req.params.model} not found.`);
		}
	}
};
