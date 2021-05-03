const router = require('express').Router();
const controller = require('../../controllers/phone-controller.js');
const asyncHandler = require('express-async-handler');

/**
 * @openapi
 * components:
 *   schemas:
 *     PhoneInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The common name this phone is referred to.
 *           example: LG Nexus 4
 *         gsmArenaUrl:
 *           type: string
 *           format: uri
 *           description: The URL reference to the GSM Arena phone page.
 *           example: 'https://www.gsmarena.com/lg_nexus_4_e960-5048.php'
 *         lineageos:
 *           type: string
 *           description: The lastest Lineage OS version that's supported.
 *           example: '18.1'
 *       required:
 *         - lineageos
 *         - gsmArenaUrl
 *
 *     Phone:
 *       allOf:
 *         - $ref: '#/components/schemas/PhoneInput'
 *         - type: object
 *           properties:
 *             manufacturer:
 *               type: string
 *               description: The phone manufacturer.
 *               example: LG
 *               readOnly: true
 *             model:
 *               type: string
 *               description: The phone model number.
 *               example: E960
 *               readOnly: true
 *             dimensions:
 *               type: object
 *               readonly: true
 *               properties:
 *                 height:
 *                   type: number
 *                   description: The height of the phone in mm
 *                   readonly: true
 *                   example: 133.9
 *                 width:
 *                   type: number
 *                   description: The width of the phone in mm.
 *                   readonly: true
 *                   example: 68.7
 *                 depth:
 *                   type: number
 *                   description: The depth of the phone in mm.
 *                   readonly: true
 *                   example: 9.1
 *             ram:
 *               type: integer
 *               description: The amount of ram in GB.
 *               example: 2
 *               readonly: true
 *             nfc:
 *               type: boolean
 *               description: Determines whether the phone has NFC support.
 *               example: true
 *               readonly: true
 *             sensors:
 *               type: object
 *               properties:
 *                 fingerprint:
 *                   type: boolean
 *                   description: Determines whether a fingerprint sensor exists.
 *                   example: false
 *                   readonly: true
 */

/**
 * @openapi
 * /v1/phones/manufacturers/{manufacturer}/models/{model}:
 *   get:
 *     summary: Get phone information.
 *     description: |
 *       Fetches information dynamically about a phone. Before this API can return any information
 *       the PUT API must be called with bare minimum information. With the minimum information,
 *       this will pull information from resources across the spectrum to come up with the output.
 *       For performance reasons, you must cache the results honoring cache-control headers.
 *     parameters:
 *       - in: path
 *         name: manufacturer
 *         schema:
 *           type: string
 *         required: true
 *         description: The manufacturer of the phone.
 *       - in: path
 *         name: model
 *         schema:
 *           type: string
 *         required: true
 *         description: The phone model number.
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Phone'
 *       default:
 *         description: All other errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
	'/manufacturers/:manufacturer/models/:model',
	asyncHandler(controller.getPhoneByManufacturerAndModel)
);

/**
 * @openapi
 * /v1/phones/manufacturers/{manufacturer}/models/{model}:
 *   put:
 *     summary: Update phone information.
 *     parameters:
 *       - in: path
 *         name: manufacturer
 *         schema:
 *           type: string
 *         required: true
 *         description: The manufacturer of the phone.
 *       - in: path
 *         name: model
 *         schema:
 *           type: string
 *         required: true
 *         description: The phone model number.
 *     requestBody:
 *       description: The phone data to update.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PhoneInput'
 *     responses:
 *       '204':
 *         description: No Content
 *       default:
 *         description: All other errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
	'/manufacturers/:manufacturer/models/:model',
	asyncHandler(controller.savePhoneByManufacturerAndModel)
);

module.exports = router;
