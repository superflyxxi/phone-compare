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
		if (/wireless/iv.test(td.innerHTML)) {
			return {wireless: true};
		}
	}

	return {wireless: false};
}

function getDimensions(document) {
	let dimensions = document.querySelector('[data-spec="dimensions"]').innerHTML;
	dimensions = dimensions.match(/\d+\.*\d*/gv);
	return {
		height: Number(dimensions[0]),
		width: Number(dimensions[1]),
		depth: Number(dimensions[2]),
	};
}

function getRAM(document) {
	return Number(
		document
			.querySelector('[data-spec="internalmemory"]')
			.innerHTML.match(/\d+GB RAM/v)[0]
			.match(/\d/v)[0],
	);
}

function getNFC(document) {
	const nfcMatch = document.querySelector('[data-spec="nfc"]').innerHTML.match(/yes/iv);
	return nfcMatch !== undefined && nfcMatch !== null;
}

function getSensors(document) {
	const fingerprintMatch = document.querySelector('[data-spec="sensors"]').innerHTML.match(/fingerprint/iv);
	return {
		fingerprint: fingerprintMatch !== undefined && fingerprintMatch !== null,
	};
}

function getPrice(document) {
	const priceHtml = document.querySelector('[data-spec="price"]')?.querySelector('a')?.innerHTML;
	if (priceHtml) {
		return {
			usd: Number(priceHtml.match(/\d+\.\d+/gv)[0]),
			eur: Number(priceHtml.match(/\d+\.\d+/gv)[1]),
		};
	}

	return undefined;
}

function getYearReleased(document) {
	const releasedHtml = document.querySelector('[data-spec="released-hl"]')?.innerHTML;
	if (releasedHtml) {
		return Number(releasedHtml.match(/\d+/v)[0], 10);
	}

	return undefined;
}

function getAndroidVersion(document) {
	const android = document.querySelector('[data-spec="os"]').innerHTML.match(/\d+(\.\d+)?/gv);
	return {
		official: android.at(-1),
	};
}
