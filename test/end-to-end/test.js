const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../src/index.js');
const {expect} = chai;
const nock = require('nock');

chai.use(chaiHttp);

describe('End-to-end tests', () => {
	before(() => nock.cleanAll());

	it('Compare 3 phones', (done) => {
		// Create the pixel 5
		chai
			.request(app)
			.put('/v1/phones/manufacturers/Google/models/GD1YQ')
			.send({
				name: 'Google Pixel 5',
				gsmArenaUrl: 'https://www.gsmarena.test/google_pixel_5-10386.php',
				lineageos: '18.1'
			})
			.end((error, res) => {
				expect(res).to.have.status(204);
			});
		// Create the pixel 4
		chai
			.request(app)
			.put('/v1/phones/manufacturers/Google/models/G020I')
			.send({
				name: 'Google Pixel 4',
				gsmArenaUrl: 'https://www.gsmarena.com/google_pixel_4-9896.php',
				lineageos: '18.1'
			})
			.end((error, res) => {
				expect(res).to.have.status(204);
			});
		// Create the nexus 4
		chai
			.request(app)
			.put('/v1/phones/manufacturers/LG/models/E960')
			.send({
				name: 'LG Nexus 4',
				gsmArenaUrl: 'https://www.gsmarena.com/lg_nexus_4_e960-5048.php',
				lineageos: '16.1'
			})
			.end((error, res) => {
				expect(res).to.have.status(204);
			});

		chai
			.request(app)
			.post('/v1/phones/compare')
			.send({
				ranking: ['dimensions.height']
			})
			.end((error, res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.deep.include.almost({
					best: {
						manufacturer: 'LG',
						model: 'E960',
						name: 'LG Nexus 4',
						dimensions: {
							height: 133.9
						},
						score: 2,
						scoreBreakdown: {
							'dimensions.height': 2
						}
					},
					results: [
						{
							manufacturer: 'LG',
							model: 'E960',
							name: 'LG Nexus 4',
							dimensions: {
								height: 133.9
							},
							score: 2,
							scoreBreakdown: {
								'dimensions.height': 2
							}
						},
						{
							manufacturer: 'Google',
							model: 'GD1YQ',
							name: 'Google Pixel 5',
							dimensions: {
								height: 144.7
							},
							score: 0.4,
							scoreBreakdown: {
								'dimensions.height': 0.4
							}
						},
						{
							manufacturer: 'Google',
							model: 'G020I',
							name: 'Google Pixel 4',
							dimensions: {
								height: 147.1
							},
							score: 0,
							scoreBreakdown: {
								'dimensions.height': 0
							}
						}
					]
				});
				done();
			});
	});
});
