import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import cache from '../../src/helpers/cache.js';

function cleanupCache() {
	cache.flushAll();
}

function cleanupDataDir() {
	for (const file of fs.readdirSync(process.env.DATA_DIR)) {
		fs.unlinkSync(path.join(process.env.DATA_DIR, file));
	}
}

export default function cleanupEverything() {
	cleanupCache();
	cleanupDataDir();
}
