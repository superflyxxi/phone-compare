const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../../../../src/index.js');
const {expect} = chai;

chai.use(chaiHttp);

describe('Phone-compare negative tests', () => {
	it('Unsupport ranking only', (done) => {
		chai
			.request(app)
			.post('/v1/phones/compare')
			.send({
				phones: [{manufacturer: 'google', model: 'gd1yq'}],
				ranking: ['lineageos']
			})
			.end((error, res) => {
				expect(res).to.have.status(400);
				done();
			});
	});

	it('Unsupport ranking with supported', (done) => {
		chai
			.request(app)
			.post('/v1/phones/compare')
			.send({
				phones: [{manufacturer: 'google', model: 'gd1yq'}],
				ranking: ['nfc', 'lineageos']
			})
			.end((error, res) => {
				expect(res).to.have.status(400);
				done();
			});
	});
});
