const validate = require('validate.js');
const ValidationError = require('../error-handler/validation-error');

exports.validate = function(obj, constraints) {
	const result = validate(obj, constraints);
	if (result) {
		throw new ValidationError(result);
	}
}
