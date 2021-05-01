const RouteNotFoundError = require('./error-handler/RouteNotFoundError.js');
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.disable('x-powered-by');

app.use('/v1/phones', require('./routers/v1/phones.js'));

// eslint-disable-next-line no-unused-vars
app.use((req, res, next) => {
	throw new RouteNotFoundError(req);
});
app.use(require('morgan')('short'));
app.use(require('./error-handler/index.js').errorHandler);

app.listen(port, () => {
	console.log('Started listening on', port);
});

module.exports = app;
