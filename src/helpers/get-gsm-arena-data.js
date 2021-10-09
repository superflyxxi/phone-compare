import axios from 'axios';
import jsdom from 'jsdom';
import cache from './cache.js';

export default async function getGsmArenaData(gsmUrl) {
	let data = cache.get(gsmUrl);
	if (!data) {
		data = {};
		const res = await axios.get(gsmUrl);
		const dom = new jsdom.JSDOM(res.data);
		const doc = dom.window.document;

		data.dimensions = getDimensions(doc);
		data.ram = getRAM(doc);
		data.nfc = getNFC(doc):
		data.sensors = getSensors(doc);
		data.price = getPrice(doc);

		const releasedHtml = dom.window.document.querySelector('[data-spec="released-hl"]')?.innerHTML;
		if (releasedHtml) {
			data.year = Number.parseInt(releasedHtml.match(/\d+/g)[0], 10);
		}

		const android = dom.window.document.querySelector('[data-spec="os"]').innerHTML.match(/\d+(\.\d+)?/g);
		data.android = {
			official: android[android.length - 1],
		};

		// Misc things that aren't easy to find
		data.charging = getWirelessCharging(doc);

		cache.set(gsmUrl, data, 2_419_200); // 1 week
	}

	return data;
}

function getWirelessCharging(doc) {
	const tdList = doc.querySelectorAll('td.nfo');
	for (const td of tdList) {
		if (/wireless charg/i.test(td.innerHTML)) {
			return {wireless: true};
		}
	}
	return {wireless: false};
}

function getDimensions(doc) {
	let dimensions = doc.querySelector('[data-spec="dimensions"]').innerHTML;
	dimensions = dimensions.match(/\d+\.*\d*/g);
	return {
		height: Number.parseFloat(dimensions[0]),
		width: Number.parseFloat(dimensions[1]),
		depth: Number.parseFloat(dimensions[2]),
	};
}

function getRAM(doc) {
	return Number.parseFloat(doc.querySelector('[data-spec="internalmemory"]').innerHTML.match(/\d+GB RAM/g)[0].match(/\d/g)[0]);
}

function getNFC(doc) {
	const nfcMatch = doc.querySelector('[data-spec="nfc"]').innerHTML.match(/yes/i);
	return nfcMatch !== undefined && nfcMatch !== null;
}

function getSensors(doc) {
	const fingerprintMatch = doc.querySelector('[data-spec="sensors"]').innerHTML.match(/fingerprint/i);
	return {
		fingerprint: fingerprintMatch !== undefined && fingerprintMatch !== null,
	};
}

function getPrice(doc) {
	const priceHtml = doc.querySelector('[data-spec="price"]')?.querySelector('a')?.innerHTML;
	if (priceHtml) {
		return = {
			usd: Number.parseFloat(priceHtml.match(/\d+\.\d+/g)[0]),
			eur: Number.parseFloat(priceHtml.match(/\d+\.\d+/g)[1]),
		};
	}
	return undefined;
}