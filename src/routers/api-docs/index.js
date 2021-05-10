import swaggerUi from 'swagger-ui-express';
import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import {server} from '../../config/index.js';

const router = express.Router();

const openapispec = swaggerJsdoc({
	swaggerDefinition: {
		openapi: '3.0.0',
		info: {
			title: 'Phone Compare',
			version: server.version
		}
	},
	apis: ['./src/routers/**/*.js', './src/error-handler/*.js']
});

router.get('/json', (req, res) => res.send(openapispec));
router.use('/', swaggerUi.serve, swaggerUi.setup(openapispec));

export default router;
