import {expect} from 'chai';
import nock from 'nock';
import app from '../../../../../src/index.js';
import {chai, cleanupEverything} from '../../../../helpers/index.js';

describe('Phone-compare positive tests', () => {
	after(cleanupEverything);
	afterEach(() => nock.cleanAll());
	beforeEach(() => {
		// Mock the phones
		const googlePixel5 = {
			manufacturer: 'Google',
			model: 'GD1YQ',
			name: 'Google Pixel 5',
			gsmArenaUrl: 'https://www.gsmarena.com/google_pixel_5-10386.php',
			lineageos: '18.2',
			dimensions: {
				height: 144.7,
				width: 70.4,
				depth: 8,
			},
			ram: 8,
			nfc: true,
			sensors: {fingerprint: true},
			price: {usd: 649.99, eur: 649.99},
			year: 2020,
			charging: {wireless: true},
			android: {official: '11', lineageos: '11', max: '11'},
		};
		const googlePixel4 = {
			manufacturer: 'Google',
			model: 'G020I',
			name: 'Google Pixel 4',
			gsmArenaUrl: 'https://www.gsmarena.com/google_pixel_4-9896.php',
			lineageos: '18.1',
			dimensions: {
				height: 147.1,
				width: 68.8,
				depth: 8.2,
			},
			ram: 6,
			nfc: true,
			sensors: {fingerprint: true},
			price: {usd: 399.99, eur: 399.99},
			year: 2019,
			charging: {wireless: true},
			android: {official: '11', lineageos: '11', max: '11'},
		};
		const lgNexus4 = {
			manufacturer: 'LG',
			model: 'E960',
			name: 'LG Nexus 4',
			gsmArenaUrl: 'https://www.gsmarena.com/lg_nexus_4_e960-5048.php',
			lineageos: '16.1',
			dimensions: {
				height: 133.9,
				width: 68.7,
				depth: 9.1,
			},
			ram: 2,
			nfc: true,
			sensors: {fingerprint: false},
			price: {usd: 49.99, eur: 49.99},
			year: 2012,
			charging: {wireless: true},
			android: {official: '5.1', lineageos: '9', max: '9'},
		};

		// Pixel 5
		nock('http://localhost:3000').get('/v1/phones/manufacturers/google/models/gd1yq').reply(200, googlePixel5);

		// Pixel 4
		nock('http://localhost:3000').get('/v1/phones/manufacturers/google/models/g020i').reply(200, googlePixel4);

		// Nexus 4
		nock('http://localhost:3000').get('/v1/phones/manufacturers/lg/models/e960').reply(200, lgNexus4);

		nock('http://localhost:3000')
			.get('/v1/phones')
			.reply(200, [
				{
					href:
						'manufacturers/' + googlePixel5.manufacturer.toLowerCase() + '/models/' + googlePixel5.model.toLowerCase(),
				},
				{
					href:
						'manufacturers/' + googlePixel4.manufacturer.toLowerCase() + '/models/' + googlePixel4.model.toLowerCase(),
				},
				{href: 'manufacturers/' + lgNexus4.manufacturer.toLowerCase() + '/models/' + lgNexus4.model.toLowerCase()},
			]);
	});

	const allPhoneHeightExpected = {
		best: {
			href: '/v1/phones/manufacturers/lg/models/e960',
			score: 2,
			scoreBreakdown: {
				'dimensions.height': 2,
			},
		},
		results: [
			{
				href: '/v1/phones/manufacturers/lg/models/e960',
				score: 2,
				scoreBreakdown: {
					'dimensions.height': 2,
				},
			},
			{
				href: '/v1/phones/manufacturers/google/models/gd1yq',
				score: 0.4,
				scoreBreakdown: {
					'dimensions.height': 0.4,
				},
			},
			{
				href: '/v1/phones/manufacturers/google/models/g020i',
				score: 0,
				scoreBreakdown: {
					'dimensions.height': 0,
				},
			},
		],
	};

	/*
	 * Max height = 147.1
	 * min height = 133.9
	 * diff = 13.2
	 * height is worth 2pts, 2/13.2 = 0.15
	 * So 0.15 per mm below max.
	 * pixel5 = 144.7; 2.4*0.15 = 0.36pts
	 * pixel4 = max; = 0pts
	 * nexus4 = min; = 2pts
	 */
	it('Rank on a number (height)', (done) => {
		chai.request
			.execute(app)
			.post('/v1/phones/compare')
			.send({
				phones: [
					{manufacturer: 'LG', model: 'E960'},
					{manufacturer: 'Google', model: 'G020I'},
					{manufacturer: 'Google', model: 'GD1YQ'},
				],
				ranking: ['dimensions.height'],
			})
			.end((error, res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.deep.include.almost(allPhoneHeightExpected);
				done();
			});
	});

	/*
	 * Max height = 147.1, min height = 133.9, diff = 13.2
	 * height is worth 4pts, 4/13.2 = 0.30
	 * pixel5 = 144.7; 2.4*0.30 = 0.72pts
	 * pixel4 = max; = 0pts
	 * nexus4 = min; = 4pts
	 * width max=70.4 min=68.7 diff=1.7
	 * width = 2pts, 2/1.7 = 1.18pts per mm under max
	 * pixel5 = max = 0pts
	 * pixel4 = 68.8; 1.6*1.18 = 1.89pts
	 * nexus4 = min; = 2pts
	 *
	 * nexus4=4+2
	 * pixel4=0+1.89
	 * pixel5=0.72+0
	 */
	it('Rank on two numbers (height, width)', (done) => {
		chai.request
			.execute(app)
			.post('/v1/phones/compare')
			.send({
				phones: [
					{manufacturer: 'LG', model: 'E960'},
					{manufacturer: 'Google', model: 'G020I'},
					{manufacturer: 'Google', model: 'GD1YQ'},
				],
				ranking: ['dimensions.height', 'dimensions.width'],
			})
			.end((error, res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.deep.include.almost({
					best: {
						href: '/v1/phones/manufacturers/lg/models/e960',
						score: 6,
						scoreBreakdown: {
							'dimensions.height': 4,
							'dimensions.width': 2,
						},
					},
					results: [
						{
							href: '/v1/phones/manufacturers/lg/models/e960',
							score: 6,
							scoreBreakdown: {
								'dimensions.height': 4,
								'dimensions.width': 2,
							},
						},
						{
							href: '/v1/phones/manufacturers/google/models/g020i',
							score: 1.9,
							scoreBreakdown: {
								'dimensions.height': 0,
								'dimensions.width': 1.9,
							},
						},
						{
							href: '/v1/phones/manufacturers/google/models/gd1yq',
							score: 0.7,
							scoreBreakdown: {
								'dimensions.height': 0.7,
								'dimensions.width': 0,
							},
						},
					],
				});
				done();
			});
	});

	/*
	 * Max height = 147.1, min height = 133.9, diff = 13.2
	 * height is worth 8pts, 8/13.2 = 0.61
	 * pixel5 = 144.7; 2.4*0.61 = 1.46pts
	 * pixel4 = max; = 0pts
	 * nexus4 = min; = 8pts
	 * fingerprint is worth 4pts
	 * pixel5 = true = 4pts
	 * pixel4 = true = 4pts
	 * nexus4 = false = 0pts
	 * nfc is worth 2pts
	 * pixel5 = true = 2pts
	 * pixel4 = true = 2pts
	 * nexus4 = true = 2pts
	 *
	 * nexus4=8+0+2
	 * pixel5=1.46+4+2
	 * pixel4=0+4+2
	 */
	it('Rank on number and boolean (height, fingerprint, nfc)', (done) => {
		chai.request
			.execute(app)
			.post('/v1/phones/compare')
			.send({
				phones: [
					{manufacturer: 'LG', model: 'E960'},
					{manufacturer: 'Google', model: 'G020I'},
					{manufacturer: 'Google', model: 'GD1YQ'},
				],
				ranking: ['dimensions.height', 'sensors.fingerprint', 'nfc'],
			})
			.end((error, res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.deep.include.almost({
					best: {
						href: '/v1/phones/manufacturers/lg/models/e960',
						score: 10,
						scoreBreakdown: {
							'dimensions.height': 8,
							'sensors.fingerprint': 0,
							nfc: 2,
						},
					},
					results: [
						{
							href: '/v1/phones/manufacturers/lg/models/e960',
							score: 10,
							scoreBreakdown: {
								'dimensions.height': 8,
								'sensors.fingerprint': 0,
								nfc: 2,
							},
						},
						{
							href: '/v1/phones/manufacturers/google/models/gd1yq',
							score: 7.5,
							scoreBreakdown: {
								'dimensions.height': 1.5,
								'sensors.fingerprint': 4,
								nfc: 2,
							},
						},
						{
							href: '/v1/phones/manufacturers/google/models/g020i',
							score: 6,
							scoreBreakdown: {
								'dimensions.height': 0,
								'sensors.fingerprint': 4,
								nfc: 2,
							},
						},
					],
				});
				done();
			});
	});

	it('Rank on a number (height) against all (3) phones', (done) => {
		chai.request
			.execute(app)
			.post('/v1/phones/compare')
			.send({
				ranking: ['dimensions.height'],
			})
			.end((error, res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.deep.include.almost(allPhoneHeightExpected);
				done();
			});
	});

	it('Rank on a major version (lineageos)', (done) => {
		chai.request
			.execute(app)
			.post('/v1/phones/compare')
			.send({
				phones: [
					{manufacturer: 'Google', model: 'G020I'},
					{manufacturer: 'LG', model: 'E960'},
				],
				ranking: ['lineageos'],
			})
			.end((error, res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.deep.include.almost({
					best: {
						href: '/v1/phones/manufacturers/google/models/g020i',
						score: 2,
						scoreBreakdown: {
							lineageos: 2,
						},
					},
					results: [
						{
							href: '/v1/phones/manufacturers/google/models/g020i',
							score: 2,
							scoreBreakdown: {
								lineageos: 2,
							},
						},
						{
							href: '/v1/phones/manufacturers/lg/models/e960',
							score: 0,
							scoreBreakdown: {
								lineageos: 0,
							},
						},
					],
				});
				done();
			});
	});

	it('Rank on a minor version (lineageos)', (done) => {
		chai.request
			.execute(app)
			.post('/v1/phones/compare')
			.send({
				phones: [
					{manufacturer: 'Google', model: 'GD1YQ'},
					{manufacturer: 'Google', model: 'G020I'},
				],
				ranking: ['lineageos'],
			})
			.end((error, res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.deep.include.almost({
					best: {
						href: '/v1/phones/manufacturers/google/models/gd1yq',
						score: 2,
						scoreBreakdown: {
							lineageos: 2,
						},
					},
					results: [
						{
							href: '/v1/phones/manufacturers/google/models/gd1yq',
							score: 2,
							scoreBreakdown: {
								lineageos: 2,
							},
						},
						{
							href: '/v1/phones/manufacturers/google/models/g020i',
							score: 0,
							scoreBreakdown: {
								lineageos: 0,
							},
						},
					],
				});
				done();
			});
	});

	it('Rank on a patch version (lineageos)', (done) => {
		nock('http://localhost:3000')
			.get('/v1/phones/manufacturers/fake/models/one')
			.reply(200, {
				manufacturer: 'Fake',
				model: 'One',
				name: 'Fake One',
				gsmArenaUrl: 'https://www.gsmarena.com/google_pixel_5-10386.php',
				lineageos: '18.1.1',
				dimensions: {
					height: 144.7,
					width: 70.4,
					depth: 8,
				},
				ram: 8,
				nfc: true,
				sensors: {fingerprint: true},
				price: {usd: 649.99, eur: 649.99},
				year: 2020,
				charging: {wireless: true},
				android: {official: '11', lineageos: '11', max: '11'},
			});
		nock('http://localhost:3000')
			.get('/v1/phones/manufacturers/fake/models/two')
			.reply(200, {
				manufacturer: 'Fake',
				model: 'Tow',
				name: 'Fake Two',
				gsmArenaUrl: 'https://www.gsmarena.com/google_pixel_5-10386.php',
				lineageos: '18.1.2',
				dimensions: {
					height: 144.7,
					width: 70.4,
					depth: 8,
				},
				ram: 8,
				nfc: true,
				sensors: {fingerprint: true},
				price: {usd: 649.99, eur: 649.99},
				year: 2020,
				charging: {wireless: true},
				android: {official: '11', lineageos: '11', max: '11'},
			});
		chai.request
			.execute(app)
			.post('/v1/phones/compare')
			.send({
				phones: [
					{manufacturer: 'Fake', model: 'One'},
					{manufacturer: 'Fake', model: 'Two'},
				],
				ranking: ['lineageos'],
			})
			.end((error, res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.deep.include.almost({
					best: {
						href: '/v1/phones/manufacturers/fake/models/two',
						score: 2,
						scoreBreakdown: {
							lineageos: 2,
						},
					},
					results: [
						{
							href: '/v1/phones/manufacturers/fake/models/two',
							score: 2,
							scoreBreakdown: {
								lineageos: 2,
							},
						},
						{
							href: '/v1/phones/manufacturers/fake/models/one',
							score: 0,
							scoreBreakdown: {
								lineageos: 0,
							},
						},
					],
				});
				done();
			});
	});

	it('Rank everything', (done) => {
		chai.request
			.execute(app)
			.post('/v1/phones/compare')
			.send({
				phones: [{manufacturer: 'Google', model: 'GD1YQ'}],
				ranking: [
					'dimensions.height',
					'dimensions.width',
					'dimensions.depth',
					'price.usd',
					'price.eur',
					'ram',
					'year',
					'nfc',
					'sensors.fingerprint',
					'charging.wireless',
					'android.official',
					'android.max',
				],
			})
			.end((error, res) => {
				expect(res).to.have.status(200);
				done();
			});
	});
});
