const path = require('path');

const settingsFile = path.join(
	process.env.DATA_DIR ?? `${process.env.HOME}/data`,
	'/',
	'settings.json'
);
const fs = require('fs/promises');
const defaultSettings = {rank: ['dimensions.height']};

exports.getSettings = async function () {
	let settings;
	try {
		settings = JSON.parse(await fs.readFile(settingsFile));
	} catch {
		settings = defaultSettings;
	}

	Object.assign(settings, defaultSettings);
	return settings;
};

exports.saveSettings = async function (settings) {
	const databaseSettings = Object.assign({}, defaultSettings, settings);
	await fs.writeFile(settingsFile, JSON.stringify(databaseSettings));
};
