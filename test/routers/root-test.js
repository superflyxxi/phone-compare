import {expect} from 'chai';
import {chai} from '../helpers/index.js';
import app from '../../src/index.js';

describe('Root test', () => {
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
					detail: 'GET / not a valid API.',
				});
				expect(res.body).to.have.property('instance');
				done();
			});
	});
});
