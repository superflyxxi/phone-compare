const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.disable('x-powered-by');

app.use('/v1/phones', require('./routers/v1/phones.js'));

app.use((req, res, next) => {
	throw {
		type: '/errors/NOT_FOUND',
		title: 'Not Found',
		status: 404,
		detail: `${req.method} ${req.path} not a valid API.`
	}
});
app.use(require('morgan')('short'));
app.use(require('./error-handler/index.js').errorHandler);

app.listen(port, () => {
	console.log('Started listening on', port);
});

module.exports = app;
