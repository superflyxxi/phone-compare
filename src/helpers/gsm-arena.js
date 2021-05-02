exports.getGsmArenaData = async function (gsmUrl) {
	const data = {};
	const got = require('got');
	const res = await got(gsmUrl);
	const jsdom = require('jsdom');
	const dom = new jsdom.JSDOM(res.body);
	let dimensions = dom.window.document.querySelector('[data-spec="dimensions"]').innerHTML;
	dimensions = dimensions.match(/[0-9]+\.[0-9]*/g);
	data.dimensions = {
		height: dimensions[0],
		width: dimensions[1],
		depth: dimensions[2]
	};
	return data;
}
