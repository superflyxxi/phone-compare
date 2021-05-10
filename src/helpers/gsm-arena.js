import axios from 'axios';
import jsdom from 'jsdom';

export default async function getGsmArenaData(gsmUrl) {
	const data = {};
	const res = await axios.get(gsmUrl);
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

	const nfcMatch = dom.window.document.querySelector('[data-spec="nfc"]').innerHTML.match(/yes/i);
	data.nfc = nfcMatch !== undefined && nfcMatch !== null;

	const fingerprintMatch = dom.window.document.querySelector('[data-spec="sensors"]').innerHTML.match(/fingerprint/i);
	data.sensors = {
		fingerprint: fingerprintMatch !== undefined && fingerprintMatch !== null
	};

	const priceHtml = dom.window.document.querySelector('[data-spec="price"]')?.querySelector('a')?.innerHTML;
	if (priceHtml) {
		data.price = {
			usd: Number.parseFloat(priceHtml.match(/\d+\.\d+/g)[0]),
			eur: Number.parseFloat(priceHtml.match(/\d+\.\d+/g)[1])
		};
	}

	const releasedHtml = dom.window.document.querySelector('[data-spec="released-hl"]')?.innerHTML;
	if (releasedHtml) {
		data.year = Number.parseInt(releasedHtml.match(/\d+/g)[0], 10);
	}

	const android = dom.window.document.querySelector('[data-spec="os"]').innerHTML.match(/\d+(\.\d+)?/g);
	data.android = {
		official: android[android.length - 1]
	};

	// Misc things that aren't easy to find
	const tdList = dom.window.document.querySelectorAll('td.nfo');
	data.charging = {wireless: false};
	for (const td of tdList) {
		let considerWirelessCharging = true;
		if (considerWirelessCharging && /wireless charg/i.test(td.innerHTML)) {
			data.charging.wireless = true;
			considerWirelessCharging = false;
		}

		if (!considerWirelessCharging) {
			break;
		}
	}

	return data;
}
