const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/index.js');
const {expect} = chai;

chai.use(chaiHttp);

describe('Basic test', () => {
	it('Should get 200', (done) => {
		chai.request(app)
			.get('/')
			.end((err, res) => {
				expect(res).to.have.status(200);
				expect(res.body.message).to.equals("Hello world!");
				done();
			});
	});
});

