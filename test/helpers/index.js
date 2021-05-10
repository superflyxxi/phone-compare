import fs from 'node:fs';
import path from 'node:path';

export default function cleanupDataDir() {
	for (const file of fs.readdirSync(process.env.DATA_DIR)) {
		fs.unlinkSync(path.join(process.env.DATA_DIR, file));
	}
}
