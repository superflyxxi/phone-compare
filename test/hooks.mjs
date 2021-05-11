import fs from 'node:fs';
import zlib from 'node:zlib';

export const mochaHooks = {
	beforeAll(done) {
		console.log("Starting beforeAll hook");
		try {
			const read = fs.createReadStream('./test/resources/lg_nexus_4_e960-5048.html.gz');
			const write = fs.createWriteStream('./test/resources/lg_nexus_4_e960-5048.html');
			const unzip = zlib.createGunzip();
			read.pipe(unzip).pipe(write);
		} catch (err) {
			done(err);
		}
		done();
	}
};
