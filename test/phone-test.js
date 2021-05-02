const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/index.js');
const {expect} = chai;

let pixel5Etag;
chai.use(chaiHttp);

describe('Phones positive tests', () => {
	it('Create pixel5 phone', (done) => {
		chai
			.request(app)
			.put('/v1/phones/manufacturer/google/model/pixel5')
			.send({
				name: 'Google Pixel 5 Initial',
				gsmArenaUrl: 'https://www.gsmarena.com/google_pixel_5-10386.php'
			})
			.end((error, res) => {
				expect(res).to.have.status(204);
				done();
			});
	});

	it('Replace pixel5 phone', (done) => {
		chai
			.request(app)
			.put('/v1/phones/manufacturer/google/model/pixel5')
			.send({
				name: 'Google Pixel 5',
				gsmArenaUrl: 'https://www.gsmarena.com/google_pixel_5-10386.php'
			})
			.end((error, res) => {
				expect(res).to.have.status(204);
				done();
			});
	});

	it('Ensure it gets a valid phone', (done) => {
		chai
			.request(app)
			.get('/v1/phones/manufacturer/google/model/pixel5')
			.end((error, res) => {
				console.log('Res', res.body);
				expect(res).to.have.status(200);
				expect(res.body.manufacturer).to.equals('google');
				expect(res.body.model).to.equals('pixel5');
				expect(res.body.name).to.equals('Google Pixel 5');
				expect(res.body.gsmArenaUrl).to.equals(
					'https://www.gsmarena.com/google_pixel_5-10386.php'
				);
				expect(res.body.gsmArena.dimensions.height).to.equals(144.7);
				expect(res.body.gsmArena.dimensions.width).to.equals(70.4);
				expect(res.body.gsmArena.dimensions.depth).to.equals(8);
				expect(res.body.gsmArena.ram).to.equals(8);
				expect(res.body.gsmArena.nfc).to.equals(true);
				expect(res.body.gsmArena.sensors.fingerprint).to.equals(true);
				pixel5Etag = res.get('etag');
				done();
			});
	});

	it('Ensure ETag for same URL returns 304', (done) => {
		chai
			.request(app)
			.get('/v1/phones/manufacturer/google/model/pixel5')
			.set('etag', pixel5Etag)
			.end((error, res) => {
				expect(res).to.have.status(304);
				done();
			});
	});
});

describe('Phones negative tests', () => {
	it('Ensure ETag for diff URL returns 304', (done) => {
		chai
			.request(app)
			.get('/v1/phones/manufacturer/google/model/pixel4')
			.set('etag', pixel5Etag)
			.end((error, res) => {
				expect(res).to.have.status(304);
				done();
			});
	});
	
	it.only('Missing lineageos', (done) => {
		chai
			.request(app)
			.put('/v1/phones/manufacturer/test/model/missing')
			.send({
				name: 'Test Missing Input',
				gsmArenaUrl: 'https://www.gsmarena.com/google_pixel_5-10386.php'
			})
			.end((error, res) => {
				console.log(res.body);
				expect(res).to.have.status(400);
				expect(res.body).to.deep.include({
					type: '/errors/MISSING_REQUIRED_INPUT',
					title: 'Missing Required Attributes',
					status: res.status,
					detail: {
						lineageos: null
					}
				});
				expect(res.body).to.have.property('instance');
				done();
			});
	});
	
	it('Missing gsmArena', (done) => {
		chai
			.request(app)
			.put('/v1/phones/manufacturer/test/model/missing')
			.send({
				name: 'Test Missing Input',
				lineageos: '18.1'
			})
			.end((error, res) => {
				expect(res).to.have.status(400);
				done();
			});
	});

});
