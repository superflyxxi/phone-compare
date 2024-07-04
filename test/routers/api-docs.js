import {expect} from 'chai';
import app from '../../src/index.js';
import {chai} from '../helpers/index.js';

describe('Swagger test', () => {
	it('Should get JSON', (done) => {
		chai.request
			.execute(app)
			.get('/api-docs/json')
			.end((error, res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.have.nested.property('openapi', '3.0.0');
				expect(res.body).to.have.nested.property('info.title', 'Phone Compare');
				expect(res.body).to.have.nested.property('paths./v1/phones/compare.post');
				expect(res.body).to.have.nested.property('paths./v1/phones.get');
				expect(res.body).to.have.nested.property('paths./v1/phones/manufacturers/{manufacturer}/models/{model}.get');
				expect(res.body).to.have.nested.property('paths./v1/phones/manufacturers/{manufacturer}/models/{model}.put');
				done();
			});
	});
});
