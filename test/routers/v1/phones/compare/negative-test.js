import {expect} from 'chai';
import app from '../../../../../src/index.js';
import {chai, cleanupEverything} from '../../../../helpers/index.js';

describe('Phone-compare negative tests', () => {
	after(cleanupEverything);
	it('Unsupport ranking only', (done) => {
		chai
			.request(app)
			.post('/v1/phones/compare')
			.send({
				phones: [{manufacturer: 'google', model: 'gd1yq'}],
				ranking: ['invalid'],
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
				ranking: ['nfc', 'invalid'],
			})
			.end((error, res) => {
				expect(res).to.have.status(400);
				done();
			});
	});
});
