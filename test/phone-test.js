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
});
