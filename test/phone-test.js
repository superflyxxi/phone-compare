const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/index.js');
const {expect} = chai;

chai.use(chaiHttp);

describe('Phones positive tests', () => {
	it('Ensure it gets a valid id', (done) => {
		chai
			.request(app)
			.get('/v1/phones/manufacturer/google/model/pixel5')
			.end((error, res) => {
				expect(res).to.have.status(200);
				expect(res.body.manufacturer).to.equals('google');
				expect(res.body.model).to.equals('pixel5');
				expect(res.body.name).to.equals('Sample Phone');
				expect(res.get('etag')).to.equals('W/"40-uQiyFwqx8D7WQEgArP9VoQpGVQE"');
				done();
			});
	});

	it('Ensure ETag for same URL returns 304', (done) => {
		chai
			.request(app)
			.get('/v1/phones/manufacturer/google/model/pixel5')
			.set('etag', 'W/"40-uQiyFwqx8D7WQEgArP9VoQpGVQE"')
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
			.set('etag', 'W/"40-uQiyFwqx8D7WQEgArP9VoQpGVQE"')
			.end((error, res) => {
				expect(res).to.have.status(304);
				done();
			});
	});
});
