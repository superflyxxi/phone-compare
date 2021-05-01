const NotFoundError = require('./NotFoundError.js');

module.exports = class RouteNotFoundError extends NotFoundError {
	constructor(req) {
		super(`${req.method} ${req.path} not a valid API.`);
	}
}
