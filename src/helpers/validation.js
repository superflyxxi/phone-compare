import validatejs from 'validate.js';
import ValidationError from '../error-handler/validation-error.js';

export default function validation(object, constraints) {
	const result = validatejs(object, constraints);
	if (result) {
		throw new ValidationError(result);
	}
}
