const {v4: uuidv4} = require('uuid');

exports.errorHandler = function (error, req, res, next) {
	if (res.headersSent) {
		return next(error);
	}

	const message = {
		type: error.type ?? '/errors/SYSTEM_ERROR',
		title: error.title ?? 'System Error',
		status: error.status ?? 500,
		detail:
			error.detail ?? error.message ?? 'An unknown system error has occurred.',
		instance: uuidv4()
	};
	res.status(message.status).send(message);
};
