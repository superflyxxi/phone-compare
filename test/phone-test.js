const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/index.js');
const {expect} = chai;

chai.use(chaiHttp);

describe('Phones positive tests', () => {
	it('Ensure it gets a valid id', (done) => {
		chai
			.request(app)
			.get('/v1/phones/123')
			.end((error, res) => {
				expect(res).to.have.status(200);
				expect(res.body.id).to.equals('123');
				expect(res.body.name).to.equals('Sample Phone');
				expect(res.get('etag')).to.equals('W/"22-j/NJaav22Ac0qJZ3KUHdfXliRMM"');
				done();
			});
	});

	it('Ensure ETag for same URL returns 304', (done) => {
		chai
			.request(app)
			.get('/v1/phones/123')
			.set('etag', 'W/"22-j/NJaav22Ac0qJZ3KUHdfXliRMM"')
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
			.get('/v1/phones/123')
			.set('etag', 'W/"22-GLCX57B92Bz7OyYhZd6yzXaJlbg"')
			.end((error, res) => {
				expect(res).to.have.status(304);
				done();
			});
	});
});
