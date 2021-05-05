const validate = require('validate.js');
const ValidationError = require('../error-handler/validation-error');

exports.validate = function (object, constraints) {
	const result = validate(object, constraints);
	if (result) {
		throw new ValidationError(result);
	}
};
