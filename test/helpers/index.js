exports.cleanupDataDir = function () {
	const fs = require('fs');
	for (const file of fs.readdirSync(process.env.DATA_DIR)) {
		fs.unlinkSync(require('path').join(process.env.DATA_DIR, file));
	}
};
