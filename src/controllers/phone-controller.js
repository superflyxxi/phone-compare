const model = require('../models/phone-model.js');

exports.getPhone = async function(req, res) {
	const phone = await model.getPhone(req.params.id);
	if (phone) {
		res.status(200).send(phone);
	}
	res.status(404).send();
}

