const RootError = require('./root-error.js');

module.exports = class MissingMandatoryParametersError extends RootError {
	constructor(json) {
		super(
			'/errors/MISSING_REQUIRED_INPUT',
			'Missing Required Attributes',
			400,
			undefined
		);
		const detail = {};
		for (const attribute in json) {
			if (!json[attribute]) {
				detail[attribute] = null;
			}
		}

		this.detail = detail;
	}
};
