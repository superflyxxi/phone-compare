const swaggerUi = require('swagger-ui-express');
const path = require('path');
const RouteNotFoundError = require('./error-handler/route-not-found-error.js');
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.disable('x-powered-by');

// APIs
app.use('/v1/phones', require('./routers/v1/phones'));
app.use('/v1/phones/compare', require('./routers/v1/phones/compare'));

// Standard Stuff
const openapispec = require('swagger-jsdoc')({
	swaggerDefinition: {
		openapi: '3.0.0',
		info: {
			title: 'Phone Compare',
			version: require('./helpers/version')
		}
	},
	apis: [path.join(__dirname, '/routers/**/*.js'), path.join(__dirname, '/error-handler/*.js')]
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapispec));

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
