const router = require('express').Router();
const controller = require('../../controllers/phone-controller.js');

router.get(
	'/manufacturer/:manufacturer/model/:model',
	controller.getPhoneByManufacturerAndModel
);

module.exports = router;
