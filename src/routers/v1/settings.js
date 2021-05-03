const router = require('express').Router();
const controller = require('../../controllers/settings.js');
const asyncHandler = require('express-async-handler');

/**
 * @openapi
 * components:
 *   schemas:
 *     Settings:
 *       type: object
 *       properties:
 *         ranking:
 *           type: array
 *           description: Sorted array of important attributes.
 *           example: ['dimensions.height', 'nfc', 'lineageos']
 *           items:
 *             type: string
 *       required:
 *         - ranking
 */

/**
 * @openapi
 * /v1/settings:
 *   get:
 *     summary: Get settings
 *     parameters:
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
 *       default:
 *         description: All other errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', asyncHandler(controller.getSettings));

/**
 * @openapi
 * /v1/settings:
 *   patch:
 *     summary: Update settings
 *     requestBody:
 *       description: The settings to change.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Settings'
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
router.patch('/', asyncHandler(controller.updateSettings));

module.exports = router;
