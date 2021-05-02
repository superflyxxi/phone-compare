const router = require('express').Router();
const controller = require('../../controllers/phone-controller.js');
const asyncHandler = require('express-async-handler');

router.get(
	'/manufacturer/:manufacturer/model/:model',
	asyncHandler(controller.getPhoneByManufacturerAndModel)
);

module.exports = router;
