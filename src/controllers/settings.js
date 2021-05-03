const model = require('../models/settings.js');

export async function getSettings(req, res) {
	const settings = await model.getSettings();
	res.set('cache-control', 'public, max-age=3600').status(200).send(settings);
}

// Exports.getSettings = async function (req, res) {
exports.updateSettings = async function (req, res) {
	const existingSettings = await getSettings();
	const databaseSettings = Object.assign({}, existingSettings, req.body);
	await model.saveSettings(databaseSettings);
	res.status(204).send();
};
