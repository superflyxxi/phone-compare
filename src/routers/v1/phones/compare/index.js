const router = require('express').Router();
const controller = require('../../../../controllers/compare');
const asyncHandler = require('express-async-handler');

/**
 * @openapi
 * components:
 *   schemas:
 *     PhoneCompareRequestSinglePhone:
 *       type: object
 *       properties:
 *         manufacturer:
 *           type: string
 *           description: The phone manufacturer.
 *           example: LG
 *         model:
 *           type: string
 *           description: The phone model number.
 *           example: E960
 *     PhoneCompareRequest:
 *       type: object
 *       properties:
 *         phones:
 *           type: array
 *           description: An array of phones to compare. If not provided, then all known phones will be compared.
 *           items:
 *             $ref: '#/components/schemas/PhoneCompareRequestSinglePhone'
 *         ranking:
 *           type: array
 *           description: Sorted array of important attributes.
 *           example: ['dimensions.height', 'sensors.fingerprint', 'nfc']
 *           items:
 *             type: string
 *             enum:
 *               - dimensions.height
 *               - dimensions.width
 *               - dimensions.depth
 *               - nfc
 *               - sensors.fingerprint
 *               - price.usd
 *               - price.eur
 *       required:
 *         - ranking
 *
 *     PhoneCompareResultSinglePhone:
 *       allOf:
 *         - $ref: '#/components/schemas/PhoneCompareRequestSinglePhone'
 *         - type: object
 *           properties:
 *             href:
 *               type: string
 *               format: uri
 *               description: Refernce to the phone object for details on what was used to calcualte score.
 *             score:
 *               type: number
 *               description: The score given to this phone.
 *               example: 100.0
 *             scoreBreakdown:
 *               type: object
 *               description: Scores award for each property.
 *               properties:
 *                 nfc:
 *                   type: number
 *                 'dimensions.height':
 *                   type: number
 *                 'dimensions.width':
 *                   type: number
 *                 'dimensions.depth':
 *                   type: number
 *                 'sensors.fingerprint':
 *                   type: number
 *                 'price.usd':
 *                   type: number
 *                 'price.eur':
 *                   type: number
 *
 *     PhoneCompareResult:
 *       type: object
 *       properties:
 *         best:
 *           $ref: '#/components/schemas/PhoneCompareResultSinglePhone'
 *         results:
 *           type: array
 *           description: An array of phone results ranked based on settings.
 *           items:
 *             $ref: '#/components/schemas/PhoneCompareResultSinglePhone'
 */

/**
 * @openapi
 * /v1/phones/compare:
 *   post:
 *     summary: Calculate best phone
 *     description: |
 *       Fetches information about the request /v1/phones and based on /v1/settings will determine
 *       the best phone and why.
 *     produces:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PhoneCompareRequest'
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PhoneCompareResult'
 *       default:
 *         description: All other errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', asyncHandler(controller.comparePhones));

module.exports = router;
