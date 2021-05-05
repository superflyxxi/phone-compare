const router = require('express').Router();
const controller = require('../../../../controllers/phone-compare');
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
 *           example: ['dimensions.height', 'nfc', 'lineageos']
 *           items:
 *             type: string
 *       required:
 *         - phones
 *         - ranking
 *
 *     PhoneCompareResultSinglePhone:
 *       allOf:
 *         - $ref: '#/components/schemas/PhoneCompareRequestSinglePhone'
 *         - type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Human readable name.
 *               example: LG Nexus 4
 *             score:
 *               type: number
 *               description: The score given to this phone.
 *               example: 100.0
 *             scoreBreakdown:
 *               type: object
 *               properties:
 *                 nfc:
 *                   type: number
 *                   description: The score awarded through nfc.
 *                   example: 10
 *                 height:
 *                   type: number
 *                   description: The score awarded through height.
 *                   example: 20
 *                 fingerprint:
 *                   type: number
 *                   description: The score awarded through fingerprint.
 *                   example: 40
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
