exports.getGsmArenaData = async function (gsmUrl) {
	const data = {};
	const got = require('got');
	const res = await got(gsmUrl);
	const jsdom = require('jsdom');
	const dom = new jsdom.JSDOM(res.body);
	let dimensions = dom.window.document.querySelector('[data-spec="dimensions"]')
		.innerHTML;
	dimensions = dimensions.match(/\d+\.*\d*/g);
	data.dimensions = {
		height: Number.parseFloat(dimensions[0]),
		width: Number.parseFloat(dimensions[1]),
		depth: Number.parseFloat(dimensions[2])
	};
	let ram = dom.window.document.querySelector('[data-spec="internalmemory"]').innerHTML.match(/\d+GB RAM/g);
	data.ram = Number.parseFloat(ram[0].match(/\d/g)[0]);
	return data;
};
