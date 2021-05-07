const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../src/index.js');
const {expect} = chai;
const helper = require('../helpers');

chai.use(chaiHttp);
chai.use(require('chai-almost')(0.1));

describe('End-to-end tests', () => {
	after(helper.cleanupDataDir);

	it('Compare 3 phones', (done) => {
		// Create the pixel 5
		chai
			.request(app)
			.put('/v1/phones/manufacturers/Google/models/GD1YQ')
			.send({
				name: 'Google Pixel 5',
				gsmArenaUrl: 'https://www.gsmarena.com/google_pixel_5-10386.php',
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
						href: '/v1/phones/manufacturers/lg/models/e960',
						score: 2,
						scoreBreakdown: {
							'dimensions.height': 2
						}
					},
					results: [
						{
							href: '/v1/phones/manufacturers/lg/models/e960',
							score: 2,
							scoreBreakdown: {
								'dimensions.height': 2
							}
						},
						{
							href: '/v1/phones/manufacturers/google/models/gd1yq',
							score: 0.4,
							scoreBreakdown: {
								'dimensions.height': 0.4
							}
						},
						{
							href: '/v1/phones/manufacturers/google/models/g020i',
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
}).timeout(30000);
