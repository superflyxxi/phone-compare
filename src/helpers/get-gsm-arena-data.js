import axios from 'axios';
import jsdom from 'jsdom';
import cache from './cache.js';

export default async function getGsmArenaData(gsmUrl) {
	let data = cache.get(gsmUrl);
	if (!data) {
		const res = await axios.get(gsmUrl);
		const dom = new jsdom.JSDOM(res.data);
		const {document} = dom.window;

		data = {
			dimensions: getDimensions(document),
			ram: getRAM(document),
			nfc: getNFC(document),
			sensors: getSensors(document),
			price: getPrice(document),
			year: getYearReleased(document),
			android: getAndroidVersion(document),
			charging: getWirelessCharging(document),
		};

		cache.set(gsmUrl, data, 2_419_200); // 1 week
	}

	return data;
}

function getWirelessCharging(document) {
	const tdList = document.querySelectorAll('td.nfo');
	for (const td of tdList) {
		if (/wireless/i.test(td.innerHTML)) {
			return {wireless: true};
		}
	}

	return {wireless: false};
}

function getDimensions(document) {
	let dimensions = document.querySelector('[data-spec="dimensions"]').innerHTML;
	dimensions = dimensions.match(/\d+\.*\d*/g);
	return {
		height: Number.parseFloat(dimensions[0]),
		width: Number.parseFloat(dimensions[1]),
		depth: Number.parseFloat(dimensions[2]),
	};
}

function getRAM(document) {
	return Number.parseFloat(
		document
			.querySelector('[data-spec="internalmemory"]')
			.innerHTML.match(/\d+GB RAM/g)[0]
			.match(/\d/g)[0],
	);
}

function getNFC(document) {
	const nfcMatch = document.querySelector('[data-spec="nfc"]').innerHTML.match(/yes/i);
	return nfcMatch !== undefined && nfcMatch !== null;
}

function getSensors(document) {
	const fingerprintMatch = document.querySelector('[data-spec="sensors"]').innerHTML.match(/fingerprint/i);
	return {
		fingerprint: fingerprintMatch !== undefined && fingerprintMatch !== null,
	};
}

function getPrice(document) {
	const priceHtml = document.querySelector('[data-spec="price"]')?.querySelector('a')?.innerHTML;
	if (priceHtml) {
		return {
			usd: Number.parseFloat(priceHtml.match(/\d+\.\d+/g)[0]),
			eur: Number.parseFloat(priceHtml.match(/\d+\.\d+/g)[1]),
		};
	}

	return undefined;
}

function getYearReleased(document) {
	const releasedHtml = document.querySelector('[data-spec="released-hl"]')?.innerHTML;
	if (releasedHtml) {
		return Number.parseInt(releasedHtml.match(/\d+/g)[0], 10);
	}

	return undefined;
}

function getAndroidVersion(document) {
	const android = document.querySelector('[data-spec="os"]').innerHTML.match(/\d+(\.\d+)?/g);
	return {
		official: android.at(-1),
	};
}
