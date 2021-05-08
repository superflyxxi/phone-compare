exports.getAndroidVersion = function (lineageos) {
	const version = this.getVersionObject(lineageos);
	version.major -= 7;
	version.minor = undefined;
	version.patch = undefined;
	return version;
};

exports.getVersionString = function (object) {
	let string;
	if (object.major) {
		string = object.major.toString();
		if (object.minor) {
			string += '.' + object.minor.toString();
			if (object.patch) {
				string += '.' + object.patch.toString();
			}
		}
	}

	return string;
};

exports.getVersionObject = function (string) {
	const splt = string.split('.');
	return {
		major: splt[0] ? Number.parseInt(splt[0], 10) : undefined,
		minor: splt[1] ? Number.parseInt(splt[1], 10) : undefined,
		patch: splt[2] ? Number.parseInt(splt[2], 10) : undefined
	};
};
