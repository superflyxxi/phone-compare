const router = require('express').Router();
const controller = require('../../controllers/phone-controller.js');

router.get('/:id', controller.getPhone);

module.exports = router;
