const model = require('../models/settings.js');

exports.getSettings = async function (req, res) {
	const settings = await model.getSettings();
	res.set('cache-control', 'public, max-age=3600').send(settings);
}

exports.updateSettings = async function (req, res) {
	const existingSettings = await model.getSettings();
	const databaseSettings = Object.assign({}, existingSettings, req.body);
	await model.saveSettings(databaseSettings);
	res.status(204).send();
};
