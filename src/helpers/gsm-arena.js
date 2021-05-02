exports.getGsmArenaData = async function (gsmUrl) {
	const data = {};
	const got = require('got');
	const res = await got(gsmUrl);
	const jsdom = require('jsdom');
	const dom = new jsdom.JSDOM(res.body);
	let dimensions = dom.window.document.querySelector('[data-spec="dimensions"]').innerHTML;
	dimensions = dimensions.match(/[0-9]+\.*[0-9]*/g);
	data.dimensions = {
		height: parseFloat(dimensions[0]),
		width: parseFloat(dimensions[1]),
		depth: parseFloat(dimensions[2])
	};
	return data;
}
