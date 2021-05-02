const RootError = require('./root-error.js');

module.exports = class MissingMandatoryParametersError extends RootError {
	constructor(json) {
		super('/errors/MISSING_REQUIRED_INPUT', 'Missing Required Attributes', 400, undefined);
		const detail = {};
		for (let attr in json) {
			if (!json[attr]) {
				detail[attr] = null;
			}
		}
		this.detail = detail;
	}
};
