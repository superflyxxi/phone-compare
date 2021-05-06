const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../../../src/index.js');
const {expect} = chai;

let pixel5Etag;
chai.use(chaiHttp);

describe('Phones positive tests', () => {
	it('Create pixel5 phone', (done) => {
		chai
			.request(app)
			.put('/v1/phones/manufacturers/Google/models/GD1YQ')
			.send({
				name: 'Google Pixel 5 Initial',
				gsmArenaUrl: 'https://www.gsmarena.com/google_pixel_5-10386.php',
				lineageos: '18.1'
			})
			.end((error, res) => {
				expect(res).to.have.status(204);
				done();
			});
	});

	it('Replace pixel5 phone', (done) => {
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
				done();
			});
	});

	it('Ensure it gets a valid phone', (done) => {
		chai
			.request(app)
			.get('/v1/phones/manufacturers/Google/models/GD1YQ')
			.end((error, res) => {
				pixel5Etag = res.get('etag');
				expect(res).to.have.status(200);
				expect(res.body).to.deep.include({
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
					sensors: {
						fingerprint: true
					}
				});
				done();
			});
	});

	it('Ensure ETag for same URL returns 304', (done) => {
		chai
			.request(app)
			.get('/v1/phones/manufacturers/Google/models/GD1YQ')
			.set('if-none-match', pixel5Etag)
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
			.get('/v1/phones/manufacturers/Google/models/pixel4')
			.set('if-none-match', pixel5Etag)
			.end((error, res) => {
				expect(res).to.have.status(404);
				done();
			});
	});

	it('Missing lineageos', (done) => {
		chai
			.request(app)
			.put('/v1/phones/manufacturers/test/models/missing')
			.send({
				name: 'Test Missing Input',
				gsmArenaUrl: 'https://www.gsmarena.com/google_pixel_5-10386.php'
			})
			.end((error, res) => {
				expect(res).to.have.status(400);
				expect(res.body).to.deep.include({
					type: '/errors/VALIDATION_ERROR',
					title: 'Validation Error',
					status: res.status,
					detail: {
						lineageos: ["Lineageos can't be blank"]
					}
				});
				expect(res.body).to.have.property('instance');
				done();
			});
	});

	it('Missing gsmArena', (done) => {
		chai
			.request(app)
			.put('/v1/phones/manufacturers/test/models/missing')
			.send({
				name: 'Test Missing Input',
				lineageos: '18.1'
			})
			.end((error, res) => {
				expect(res).to.have.status(400);
				expect(res.body).to.deep.include({
					type: '/errors/VALIDATION_ERROR',
					title: 'Validation Error',
					status: res.status,
					detail: {
						gsmArenaUrl: ["Gsm arena url can't be blank"]
					}
				});
				done();
			});
	});
});
