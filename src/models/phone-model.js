
/*
 * Phone = {
 * manufacturer
 * model
 * gsmarenaUrl
 * height
 * fingerprint
 * qi
 * nfc
 * lineageOSVersion
 */

exports.getPhone = async function (manufacturer, model) {
	const gsm = await require('../helpers/gsm-arena.js').getGsmArenaData('https://www.gsmarena.com/google_pixel_5-10386.php');
	return {manufacturer, model, name: 'Sample Phone', gsmArena: gsm};
};

exports.savePhone = function (manufacturer, model, phone) {
}
