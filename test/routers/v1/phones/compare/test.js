const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../../../../src/index.js');
const {expect} = chai;

chai.use(chaiHttp);

describe('Phone-compare positive tests', () => {
	before(() => {
		// Create the phones
		// pixel 5
		chai
			.request(app)
			.put('/v1/phones/manufacturers/google/models/gd1yq')
			.send({
				name: 'Google Pixel 5',
				gsmArenaUrl: 'https://www.gsmarena.com/google_pixel_5-10386.php',
				lineageos: '18.1'
			})
			.end();

		// Pixel 4
		chai
			.request(app)
			.put('/v1/phones/manufacturers/google/models/g020i')
			.send({
				name: 'Google Pixel 4',
				gsmArenaUrl: 'https://www.gsmarena.com/google_pixel_4-9896.php',
				lineageos: '18.1'
			})
			.end();

		// Nexus 4
		chai
			.request(app)
			.put('/v1/phones/manufacturers/lg/models/e960')
			.send({
				name: 'LG Nexus 4',
				gsmArenaUrl: 'https://www.gsmarena.com/lg_nexus_4_e960-5048.php',
				lineageos: '16.1'
			})
			.end();
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
