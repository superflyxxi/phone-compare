import express from 'express';
import morgan from 'morgan';
import RouteNotFoundError from './error-handler/route-not-found-error.js';
import {server} from './config/index.js';
import errorHandler from './error-handler/index.js';

import phoneRouter from './routers/v1/phones/index.js';
import compareRouter from './routers/v1/phones/compare/index.js';
import apiDocsRouter from './routers/api-docs/index.js';

const app = express();
app.use(express.json());
app.disable('x-powered-by');

// APIs
app.use('/v1/phones', phoneRouter);
app.use('/v1/phones/compare', compareRouter);
app.use('/api-docs', apiDocsRouter);

// eslint-disable-next-line no-unused-vars
app.use((req, res, next) => {
	throw new RouteNotFoundError(req);
});

app.use(morgan('short'));
app.use(errorHandler);

app.listen(server.port, () => {
	console.log('Started version', server.version, 'listening on', server.port);
});

export default app;
