const RootError = require('./root-error.js');

module.exports = class ValidationError extends RootError {
	constructor(result) {
		super('/errors/VALIDATION_ERROR', 'Validation Error', 400, result);
	}
};
