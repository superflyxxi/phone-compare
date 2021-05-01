const model = require('../models/phone-model.js');

exports.getPhone = async function (req, res, next) {
	if (req.get('etag')) {
		res.status(304).send();
		next();
	}

	const phone = await model.getPhone(req.params.id);
	if (phone) {
		res.set('cache-control', 'public, max-age=2419200').status(200).send(phone);
		next();
	}

	res.status(404).send();
	next();
};
