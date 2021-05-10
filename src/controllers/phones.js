import model from '../models/phones.js';
import NotFoundError from '../error-handler/not-found-error.js';

async function getAllPhones(req, res) {
	const phoneList = await model.getAllPhones();
	res.set('cache-control', 'public, max-age=2419200').send(phoneList);
}

async function getPhoneByManufacturerAndModel(req, res) {
	const phone = await model.getPhone(req.params.manufacturer, req.params.model);
	if (phone) {
		res.set('cache-control', 'public, max-age=2419200').send(phone);
	} else {
		throw new NotFoundError(`${req.params.manufacturer}/${req.params.model} not found.`);
	}
}

async function savePhoneByManufacturerAndModel(req, res) {
	const phone = req.body;
	phone.manufacturer = req.params.manufacturer;
	phone.model = req.params.model;
	await model.savePhone(phone);
	res.status(204).send();
}

export {savePhoneByManufacturerAndModel, getPhoneByManufacturerAndModel, getAllPhones};
