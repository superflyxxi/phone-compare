import {expect} from 'chai';
import nock from 'nock';
import app from '../../src/index.js';
import {cleanupEverything, chai} from '../helpers/index.js';

describe('End-to-end tests', () => {
	after(cleanupEverything);
	beforeEach(() => {
		nock('https://www.gsmarena.com').get('/google_pixel_5-10386.php').replyWithFile(200, 'test/data/pixel5.html');
		nock('https://www.gsmarena.com').get('/google_pixel_4-9896.php').replyWithFile(200, 'test/data/pixel4.html');
		nock('https://www.gsmarena.com').get('/lg_nexus_4_e960-5048.php').replyWithFile(200, 'test/data/nexus4.html');
	});

	it('Compare 3 phones', (done) => {
		// Create the pixel 5
		chai.request
			.execute(app)
			.put('/v1/phones/manufacturers/Google/models/GD1YQ')
			.send({
				name: 'Google Pixel 5',
				gsmArenaUrl: 'https://www.gsmarena.com/google_pixel_5-10386.php',
				lineageos: '18.1',
			})
			.end((error, res) => {
				expect(res).to.have.status(204);
			});
		// Create the pixel 4
		chai.request
			.execute(app)
			.put('/v1/phones/manufacturers/Google/models/G020I')
			.send({
				name: 'Google Pixel 4',
				gsmArenaUrl: 'https://www.gsmarena.com/google_pixel_4-9896.php',
				lineageos: '18.1',
			})
			.end((error, res) => {
				expect(res).to.have.status(204);
			});
		// Create the nexus 4
		chai.request
			.execute(app)
			.put('/v1/phones/manufacturers/LG/models/E960')
			.send({
				name: 'LG Nexus 4',
				gsmArenaUrl: 'https://www.gsmarena.com/lg_nexus_4_e960-5048.php',
				lineageos: '16.1',
			})
			.end((error, res) => {
				expect(res).to.have.status(204);
			});

		chai.request
			.execute(app)
			.post('/v1/phones/compare')
			.send({
				ranking: ['android.max', 'dimensions.height', 'sensors.fingerprint', 'charging.wireless', 'ram', 'nfc', 'year'],
			})
			.end((error, res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.deep.include.almost({
					best: {
						href: '/v1/phones/manufacturers/google/models/gd1yq',
						scoreBreakdown: {
							'android.max': 128,
							'dimensions.height': 11.6,
							'sensors.fingerprint': 32,
							'charging.wireless': 16,
							ram: 8,
							nfc: 4,
							year: 2,
						},
						score: 201.6,
					},
					results: [
						{
							href: '/v1/phones/manufacturers/google/models/gd1yq',
							scoreBreakdown: {
								'android.max': 128,
								'dimensions.height': 11.6,
								'sensors.fingerprint': 32,
								'charging.wireless': 16,
								ram: 8,
								nfc: 4,
								year: 2,
							},
							score: 201.6,
						},
						{
							href: '/v1/phones/manufacturers/google/models/g020i',
							score: 129.5,
							scoreBreakdown: {
								'android.max': 102.4,
								'charging.wireless': 16,
								'dimensions.height': 0,
								nfc: 4,
								ram: 5.3,
								'sensors.fingerprint': 0,
								year: 1.8,
							},
						},
						{
							href: '/v1/phones/manufacturers/lg/models/e960',
							score: 84,
							scoreBreakdown: {
								'android.max': 0,
								'charging.wireless': 16,
								'dimensions.height': 64,
								nfc: 4,
								ram: 0,
								'sensors.fingerprint': 0,
								year: 0,
							},
						},
					],
				});
				done();
			});
	}).timeout(30_000);
});
