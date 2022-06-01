import fs from 'node:fs';

const dimensionRules = {
	type: 'number',
	scoreMethod: 'PREFER_LOW',
};

const priceRules = {
	type: 'number',
	scoreMethod: 'PREFER_LOW',
};

const versionRules = {
	type: 'version',
	scoreMethod: 'PREFER_HIGH',
};

const rankRules = {
	'dimensions.height': dimensionRules,
	'dimensions.width': dimensionRules,
	'dimensions.depth': dimensionRules,
	ram: {
		type: 'number',
		scoreMethod: 'PREFER_HIGH',
	},
	nfc: {
		type: 'boolean',
		scoreMethod: 'PREFER_TRUE',
	},
	'price.usd': priceRules,
	'price.eur': priceRules,
	'sensors.fingerprint': {
		type: 'boolean',
		scoreMethod: 'PREFER_TRUE',
	},
	year: {
		type: 'number',
		scoreMethod: 'PREFER_HIGH',
	},
	lineageos: versionRules,
	'charging.wireless': {
		type: 'boolean',
		scoreMethod: 'PREFER_TRUE',
	},
	'android.official': versionRules,
	'android.max': versionRules,
};

const server = {
	port: 3000,
	version: getVersion(),
};

function getVersion() {
	return fs.readFileSync('./src/version.txt', {encoding: 'utf8'}).trim();
}

export {rankRules, server};
