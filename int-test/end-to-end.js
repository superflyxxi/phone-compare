import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAlmost from 'chai-almost';

const {expect} = chai;

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

chai.use(chaiHttp);
chai.use(chaiAlmost(0.1));

describe('End-to-end integration tests', () => {
	it('Compare 3 phones', (done) => {
		// Create the pixel 5
		chai
			.request(BASE_URL)
			.put('/v1/phones/manufacturers/Google/models/GD1YQ')
			.send({
				name: 'Google Pixel 5',
				gsmArenaUrl: 'https://www.gsmarena.com/google_pixel_5-10386.php',
				lineageos: '18.1'
			})
			.end((error, res) => {
				expect(error).to.equal(null);
				expect(res.status).to.equal(204);
			});
		// Create the pixel 4
		chai
			.request(BASE_URL)
			.put('/v1/phones/manufacturers/Google/models/G020I')
			.send({
				name: 'Google Pixel 4',
				gsmArenaUrl: 'https://www.gsmarena.com/google_pixel_4-9896.php',
				lineageos: '18.1'
			})
			.end((error, res) => {
				expect(error).to.equal(null);
				expect(res.status).to.equal(204);
			});
		// Create the nexus 4
		chai
			.request(BASE_URL)
			.put('/v1/phones/manufacturers/LG/models/E960')
			.send({
				name: 'LG Nexus 4',
				gsmArenaUrl: 'https://www.gsmarena.com/lg_nexus_4_e960-5048.php',
				lineageos: '16.1'
			})
			.end((error, res) => {
				expect(error).to.equal(null);
				expect(res.status).to.equal(204);
			});

		chai
			.request(BASE_URL)
			.post('/v1/phones/compare')
			.send({
				phones: [
					{manufacturer: 'lg', model: 'e960'},
					{manufacturer: 'google', model: 'g020i'},
					{manufacturer: 'google', model: 'gd1yq'}
				],
				ranking: ['android.max', 'dimensions.height', 'sensors.fingerprint', 'charging.wireless', 'ram', 'nfc', 'year']
			})
			.end((error, res) => {
				expect(error).to.equal(null);
				expect(res.status).to.equal(200);
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
							year: 2
						},
						score: 201.6
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
								year: 2
							},
							score: 201.6
						},
						{
							href: '/v1/phones/manufacturers/google/models/g020i',
							score: 155.1,
							scoreBreakdown: {
								'android.max': 128,
								'charging.wireless': 16,
								'dimensions.height': 0,
								nfc: 4,
								ram: 5.3,
								'sensors.fingerprint': 0,
								year: 1.8
							}
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
								year: 0
							}
						}
					]
				});
				done();
			});
	}).timeout(30_000);
});
