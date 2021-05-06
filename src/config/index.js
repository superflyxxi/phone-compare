exports.rankRules = {
	'dimensions.height': {
		type: 'number',
		scoreMethod: 'FROM_MAX',
		precision: 0.01
	}
};
exports.server = {
	port: 3000,
	version: require('../helpers/version')
};
