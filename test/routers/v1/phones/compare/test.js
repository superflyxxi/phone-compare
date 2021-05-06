const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../../../../src/index.js');
const {expect} = chai;
const nock = require('nock');

chai.use(chaiHttp);
chai.use(require('chai-almost')(0.1));

describe('Phone-compare positive tests', () => {
	beforeEach(() => {
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

	/*
 	 * max height = 147.1
 	 * min height = 133.9
 	 * diff = 13.2
 	 * height is worth 2pts, 2/13.2 = 0.15
 	 * So 0.15 per mm below max.
 	 * pixel5 = 144.7; 2.4*0.15 = 0.36pts
 	 * pixel4 = max; = 0pts
 	 * nexu4 = min; = 2pts
 	 */
	it('Rank on a number (height)', (done) => {
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
	
	/*
 	 * max height = 147.1, min height = 133.9, diff = 13.2
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
		chai
			.request(app)
			.post('/v1/phones/compare')
			.send({
				phones: [
					{manufacturer: 'lg', model: 'e960'},
					{manufacturer: 'google', model: 'g020i'},
					{manufacturer: 'google', model: 'gd1yq'}
				],
				ranking: ['dimensions.height', 'dimensions.width']
			})
			.end((error, res) => {
				console.log('res.body', res.body);
				expect(res).to.have.status(200);
				expect(res.body).to.deep.include.almost({
					best: {
						manufacturer: 'LG',
						model: 'E960',
						name: 'LG Nexus 4',
						dimensions: {
							width: 68.7,
							height: 133.9
						},
						score: 6,
						scoreBreakdown: {
							'dimensions.height': 4,
							'dimensions.width': 2
						}
					},
					results: [
						{
							manufacturer: 'LG',
							model: 'E960',
							name: 'LG Nexus 4',
							dimensions: {
								width: 68.7,
								height: 133.9
							},
							score: 6,
							scoreBreakdown: {
								'dimensions.height': 4,
								'dimensions.width': 2
							}
						},
						{
							manufacturer: 'Google',
							model: 'G020I',
							name: 'Google Pixel 4',
							dimensions: {
								width: 68.8,
								height: 147.1
							},
							score: 1.9,
							scoreBreakdown: {
								'dimensions.height': 0,
								'dimensions.width': 1.9
							}
						},
						{
							manufacturer: 'Google',
							model: 'GD1YQ',
							name: 'Google Pixel 5',
							dimensions: {
								width: 70.4,
								height: 144.7
							},
							score: 0.7,
							scoreBreakdown: {
								'dimensions.height': 0.7,
								'dimensions.width': 0
							}
						}
					]
				});
				done();
			});
	});
});
