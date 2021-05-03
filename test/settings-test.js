const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/index.js');
const {expect} = chai;

chai.use(chaiHttp);

describe('Settings positive tests', () => {
	after(() => {
		require('../src/models/settings.js').deleteSettings();
	});

	let defaultEtag;
	it('Ensure it gets default settings', (done) => {
		chai
			.request(app)
			.get('/v1/settings')
			.end((error, res) => {
				defaultEtag = res.get('etag');
				expect(res).to.have.status(200);
				expect(res.body).to.deep.include({
					rank: ['dimensions.height']
				});
				expect(res).to.have.header('etag');
				expect(res).to.have.header('cache-control', 'public, max-age=3600');
				done();
			});
	});

	it('Ensure 304 since not modified', (done) => {
		chai
			.request(app)
			.get('/v1/settings')
			.set('if-none-match', defaultEtag)
			.end((error, res) => {
				expect(res).to.have.status(304);
				done();
			});
	});

	it('Update settings and ensure new etag', (done) => {
		chai
			.request(app)
			.patch('/v1/settings')
			.send({
				rank: ['nfc', 'dimensions.height']
			})
			.end((error, res) => {
				expect(res).to.have.status(204);
				done();
			});
	});

	it('Ensure it new settings', (done) => {
		chai
			.request(app)
			.get('/v1/settings')
			.end((error, res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.deep.include({
					rank: ['nfc', 'dimensions.height']
				});
				expect(res).to.not.have.header('etag', defaultEtag);
				expect(res).to.have.header('cache-control', 'public, max-age=3600');
				done();
			});
	});
});
