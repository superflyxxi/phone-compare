const router = require('express').Router();
const controller = require('../../controllers/phone-controller.js');
const asyncHandler = require('express-async-handler');

/**
 * @openapi
 * components:
 *   schemas:
 *     Phone:
 *       type: object
 *       properties:
 *         manufacturer:
 *           type: string
 *           description: The phone manufacturer.
 *           example: LG
 *           readOnly: true
 *         model:
 *           type: string
 *           description: The phone model number.
 *           example: E960
 *           readOnly: true
 *         name:
 *           type: string
 *           description: The common name this phone is referred to.
 *           example: LG Nexus 4
 *         gsmArenaUrl:
 *           type: string
 *           format: uri
 *           description: The URL reference to the GSM Arena phone page.
 *         lineageos:
 *           type: string
 *           description: The lastest Lineage OS version that's supported.
 *         dimensions:
 *           type: object
 *           readonly: true
 *           properties:
 *             height:
 *               type: number
 *               description: The height of the phone in mm
 *               readonly: true
 *             width:
 *               type: number
 *               description: The width of the phone in mm.
 *               readonly: true
 *             depth:
 *               type: number
 *               description: The depth of the phone in mm.
 *               readonly: true
 *         ram:
 *           type: integer
 *           description: The amount of ram in GB.
 *           example: 2
 *           readonly: true
 */

/**
 * @openapi
 * /v1/phones:
 *   get:
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Phone'
 */
router.get(
	'/manufacturer/:manufacturer/model/:model',
	asyncHandler(controller.getPhoneByManufacturerAndModel)
);

router.put(
	'/manufacturer/:manufacturer/model/:model',
	asyncHandler(controller.savePhoneByManufacturerAndModel)
);

module.exports = router;
