const dimensionRules = {
	type: 'number',
	scoreMethod: 'FROM_MAX'
};

exports.rankRules = {
	'dimensions.height': dimensionRules,
	'dimensions.width': dimensionRules,
	'dimensions.depth': dimensionRules,
	nfc: {
		type: 'boolean',
		scoreMethod: 'PREFER_TRUE'
	},
	'sensors.fingerprint': {
		type: 'boolean',
		scoreMethod: 'PREFER_TRUE'
	}
};

exports.server = {
	port: 3000,
	version: require('../helpers/version')
};
