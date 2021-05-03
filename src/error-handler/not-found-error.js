const RootError = require('./root-error.js');

module.exports = class NotFoundError extends RootError {
	constructor(detail) {
		super('/errors/NOT_FOUND', 'Not Found', 404, detail);
	}
};
