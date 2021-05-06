const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../../../../src/index.js');
const {expect} = chai;
const nock = require('nock');

chai.use(chaiHttp);

describe('Phone-compare positive tests', () => {
	before(() => {
		// Mock the phones

		// pixel 5
		nock('http://localhost:3000')
			.get('/v1/phones/manufacturers/google/models/gd1yq')
			.reply(200, {
				manufacturer: 'Google',
				model: 'GD1YQ',
				name: 'Google Pixel 5',
				gsmArenaUrl: 'https://www.gsmarena.com/google_pixel_5-10386.php',
				lineageos: '18.1',
				dimensions: {
					height: 144.7,
					width: 70.4,
					depth: 8
				},
				ram: 8,
				nfc: true,
				sensors: {fingerprint: true}
			});

		// Pixel 4
		nock('http://localhost:3000')
			.get('/v1/phones/manufacturers/google/models/g020i')
			.reply(200, {
				manufacturer: 'Google',
				model: 'G020I',
				name: 'Google Pixel 4',
				gsmArenaUrl: 'https://www.gsmarena.com/google_pixel_4-9896.php',
				lineageos: '18.1',
				dimensions: {
					height: 147.1,
					width: 68.8,
					depth: 8.2
				},
				ram: 6,
				nfc: true,
				sensors: {fingerprint: true}
			});

		// Nexus 4
		nock('http://localhost:3000')
			.get('/v1/phones/manufacturers/lg/models/e960')
			.reply(200, {
				manufacturer: 'LG',
				model: 'E960',
				name: 'LG Nexus 4',
				gsmArenaUrl: 'https://www.gsmarena.com/lg_nexus_4_e960-5048.php',
				lineageos: '16.1',
				dimensions: {
					height: 133.9,
					width: 68.7,
					depth: 9.1
				},
				ram: 2,
				nfc: true,
				sensors: {
					fingerprint: false
				}
			});
	});

	it('Rank on height', (done) => {
		chai
			.request(app)
			.post('/v1/phones/compare')
			.send({
				phones: [
					{manufacturer: 'lg', model: 'e960'},
					{manufacturer: 'google', model: 'g020i'},
					{manufacturer: 'google', model: 'gd1yq'}
				],
				ranking: ['dimensions.height']
			})
			.end((error, res) => {
				console.log('res.body', res.body);
				expect(res).to.have.status(200);
				expect(res.body).to.deep.include({
					best: {
						manufacturer: 'LG',
						model: 'E960',
						name: 'LG Nexus 4',
						score: 0,
						scoreBreakdown: {}
					},
					results: [
						{
							manufacturer: 'LG',
							model: 'E960',
							name: 'LG Nexus 4',
							score: 0,
							scoreBreakdown: {}
						},
						{
							manufacturer: 'Google',
							model: 'G020I',
							name: 'Google Pixel 4',
							score: 0,
							scoreBreakdown: {}
						},
						{
							manufacturer: 'Google',
							model: 'GD1YQ',
							name: 'Google Pixel 5',
							score: 0,
							scoreBreakdown: {}
						}
					]
				});
				done();
			});
	});
});
