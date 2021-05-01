const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/index.js');
const {expect} = chai;

chai.use(chaiHttp);

describe('Basic test', () => {
	it('Should get 404', (done) => {
		chai
			.request(app)
			.get('/')
			.end((error, res) => {
				expect(res).to.have.status(404);
				expect(res.body.type).to.equals('/errors/NOT_FOUND');
				expect(res.body.title).to.equals('Not Found');
				expect(res.body.status).to.equals(res.status);
				expect(res.body.detail).to.equals('GET / not a valid API.');
				expect(res.body).to.have.property('instance');
				done();
			});
	});
});
