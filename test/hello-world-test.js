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
				expect(res.body).to.deep.include({
					type: '/errors/NOT_FOUND',
					title: 'Not Found',
					status: res.status,
					detail: 'GET / not a valid API.'
				});
				expect(res.body).to.have.property('instance');
				done();
			});
	});
});
