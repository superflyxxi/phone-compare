import {expect} from 'chai';
import nock from 'nock';
import app from '../../../../src/index.js';
import {chai, cleanupEverything} from '../../../helpers/index.js';

let pixel5Etag;

describe('Phones positive tests', () => {
	afterEach(() => nock.cleanAll());
	after(cleanupEverything);
	before(() => {
		chai.request
			.execute(app)
			.put('/v1/phones/manufacturers/LG/models/E960')
			.send({
				name: 'LG Nexus 4',
				gsmArenaUrl: 'http://www.gsmarena.test/lg_nexus_4_e960-5048.php',
				lineageos: '16.1',
			})
			.end();
	});

	it('Create pixel5 phone', (done) => {
		chai.request
			.execute(app)
			.put('/v1/phones/manufacturers/Google/models/GD1YQ')
			.send({
				name: 'Google Pixel 5 Initial',
				gsmArenaUrl: 'http://www.gsmarena.test/google_pixel_5-10386.php',
				lineageos: '18.1',
			})
			.end((error, res) => {
				expect(res).to.have.status(204);
				done();
			});
	});

	it('Replace pixel5 phone', (done) => {
		chai.request
			.execute(app)
			.put('/v1/phones/manufacturers/Google/models/GD1YQ')
			.send({
				name: 'Google Pixel 5',
				gsmArenaUrl: 'http://www.gsmarena.test/google_pixel_5-10386.php',
				lineageos: '18.1',
			})
			.end((error, res) => {
				expect(res).to.have.status(204);
				done();
			});
	});

	it('Ensure it gets a valid, old phone: Nexus 4', (done) => {
		nock('http://www.gsmarena.test')
			.get('/lg_nexus_4_e960-5048.php')
			.replyWithFile(200, 'test/resources/lg_nexus_4_e960-5048.html');
		chai.request
			.execute(app)
			.get('/v1/phones/manufacturers/LG/models/E960')
			.end((error, res) => {
				expect(nock.pendingMocks.length).to.equal(0);
				expect(res).to.have.status(200);
				expect(res.body).to.deep.include({
					manufacturer: 'LG',
					model: 'E960',
					name: 'LG Nexus 4',
					gsmArenaUrl: 'http://www.gsmarena.test/lg_nexus_4_e960-5048.php',
					lineageos: '16.1',
					dimensions: {
						height: 133.9,
						width: 68.7,
						depth: 9.1,
					},
					ram: 2,
					nfc: true,
					sensors: {
						fingerprint: false,
					},
					year: 2012,
					charging: {wireless: true},
					android: {official: '5.1', lineageos: '9', max: '9'},
				});
				expect(nock.pendingMocks.length).to.equal(0);
				done();
			});
	});

	it('Ensure it gets a valid, new phone: Pixel 5', (done) => {
		nock('http://www.gsmarena.test')
			.get('/google_pixel_5-10386.php')
			.replyWithFile(200, 'test/resources/google_pixel_5-10386.html');
		chai.request
			.execute(app)
			.get('/v1/phones/manufacturers/Google/models/GD1YQ')
			.end((error, res) => {
				pixel5Etag = res.get('etag');
				expect(res).to.have.status(200);
				expect(res.body).to.deep.include({
					manufacturer: 'Google',
					model: 'GD1YQ',
					name: 'Google Pixel 5',
					gsmArenaUrl: 'http://www.gsmarena.test/google_pixel_5-10386.php',
					lineageos: '18.1',
					dimensions: {
						height: 144.7,
						width: 70.4,
						depth: 8,
					},
					ram: 8,
					nfc: true,
					sensors: {
						fingerprint: true,
					},
					price: {
						usd: 250,
						eur: 799,
					},
					year: 2020,
					charging: {wireless: true},
					android: {official: '13', lineageos: '11', max: '13'},
				});
				expect(nock.pendingMocks.length).to.equal(0);
				done();
			});
	});

	it('Ensure ETag for same URL returns 304', (done) => {
		nock('http://www.gsmarena.test')
			.get('/google_pixel_5-10386.php')
			.replyWithFile(200, 'test/resources/google_pixel_5-10386.html');
		chai.request
			.execute(app)
			.get('/v1/phones/manufacturers/Google/models/GD1YQ')
			.set('if-none-match', pixel5Etag)
			.end((error, res) => {
				expect(res).to.have.status(304);
				expect(nock.pendingMocks.length).to.equal(0);
				done();
			});
	});

	it('Get all phones', (done) => {
		chai.request
			.execute(app)
			.get('/v1/phones')
			.send()
			.end((error, res) => {
				expect(res).to.have.status(200);
				expect({test: res.body}).to.deep.include({
					test: [{href: 'manufacturers/google/models/gd1yq'}, {href: 'manufacturers/lg/models/e960'}],
				});
				expect(nock.pendingMocks.length).to.equal(0);
				done();
			});
	});
});

describe('Phones negative tests', () => {
	after(cleanupEverything);
	it('Ensure ETag for diff URL returns 404', (done) => {
		chai.request
			.execute(app)
			.get('/v1/phones/manufacturers/Google/models/pixel4')
			.set('if-none-match', pixel5Etag)
			.end((error, res) => {
				expect(res).to.have.status(404);
				done();
			});
	});

	it('Missing gsmArena', (done) => {
		chai.request
			.execute(app)
			.put('/v1/phones/manufacturers/test/models/missing')
			.send({
				name: 'Test Missing Input',
				lineageos: '18.1',
			})
			.end((error, res) => {
				expect(res).to.have.status(400);
				expect(res.body).to.deep.include({
					type: '/errors/VALIDATION_ERROR',
					title: 'Validation Error',
					status: res.status,
					detail: {
						gsmArenaUrl: ["Gsm arena url can't be blank"],
					},
				});
				done();
			});
	});
});
