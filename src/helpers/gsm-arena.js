exports.getGsmArenaData = async function (gsmUrl) {
	const data = {};
	const got = require('axios');
	const res = await got.get(gsmUrl);
	const jsdom = require('jsdom');
	const dom = new jsdom.JSDOM(res.data);
	let dimensions = dom.window.document.querySelector('[data-spec="dimensions"]').innerHTML;
	dimensions = dimensions.match(/\d+\.*\d*/g);
	data.dimensions = {
		height: Number.parseFloat(dimensions[0]),
		width: Number.parseFloat(dimensions[1]),
		depth: Number.parseFloat(dimensions[2])
	};
	const ram = dom.window.document.querySelector('[data-spec="internalmemory"]').innerHTML.match(/\d+GB RAM/g);
	data.ram = Number.parseFloat(ram[0].match(/\d/g)[0]);
	data.nfc = dom.window.document.querySelector('[data-spec="nfc"]').innerHTML.match(/yes/i) !== undefined;
	data.sensors = {
		fingerprint:
			dom.window.document.querySelector('[data-spec="sensors"]').innerHTML.match(/fingerprint/i) !== undefined
	};
	/* Data.charging = {
		usbSpeed: undefined,
		wirelessSpeed: undefined
	}; */
	const priceHtml = dom.window.document.querySelector('[data-spec="price"]')?.querySelector('a')?.innerHTML;
	if (priceHtml) {
		data.price = {
			usd: Number.parseFloat(priceHtml.match(/\d+\.\d+/g)[0]),
			eur: Number.parseFloat(priceHtml.match(/\d+\.\d+/g)[1])
		};
	}

	return data;
};
