exports.version = getVersion();

function getVersion() {
	return require('fs').readFileSync('./version.txt', {encoding: 'utf-8'}).trim();
}
