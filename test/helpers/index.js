import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {use} from 'chai';
import chaiHttp from 'chai-http';
import chaiAlmost from 'chai-almost';
import cache from '../../src/helpers/cache.js';

export const chai = use(chaiHttp);
use(chaiAlmost(0.1));

function cleanupCache() {
	cache.flushAll();
}

function cleanupDataDir() {
	for (const file of fs.readdirSync(process.env.DATA_DIR)) {
		fs.unlinkSync(path.join(process.env.DATA_DIR, file));
	}
}

export function cleanupEverything() {
	cleanupCache();
	cleanupDataDir();
}

export default cleanupEverything;
