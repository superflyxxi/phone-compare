const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/index.js');

chai.use(chaiHttp);

chai.request(app)
	.get('/')
	.end((err, res) => {
		expect(err).to.be.null;
		expect(res).to.have.status(200);
	});
