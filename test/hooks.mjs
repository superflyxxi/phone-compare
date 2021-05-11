import path from 'node:path';
import fs from 'node:fs';
import zlib from 'node:zlib';

export const mochaHooks = {
	beforeAll(done) {
		console.log('Starting beforeAll hook');
		const resourceDir = './test/resources';
		const fileList = fs.readdirSync(resourceDir);

		for (const file of fileList) {
			if (file.endsWith('.gz')) {
				try {
					const read = fs.createReadStream(path.join(resourceDir, file));
					const write = fs.createWriteStream(path.join(resourceDir, file.slice(0, -3)));
					const unzip = zlib.createGunzip();
					read.pipe(unzip).pipe(write);
				} catch {
					console.error('Error with', file);
				}
			}
		}

		done();
	}
};
