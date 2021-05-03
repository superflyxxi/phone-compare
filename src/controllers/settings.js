// Const model = require('../models/phone-model.js');

exports.getSettings = async function (req, res) {
	/*	Const phone = await model.getPhone(
		req.params.manufacturer,
		req.params.model
	); */
	const settings = null;
	res.set('cache-control', 'public, max-age=3600').status(200).send(settings);
};

exports.updateSettings = async function (req, res) {
	// Const phone = req.body;
	//	Await model.savePhone(phone);
	res.status(204).send();
};
