function getAndroidVersion(lineageos) {
	const version = this.getVersionObject(lineageos);
	version.major -= 7;
	version.minor = undefined;
	version.patch = undefined;
	return version;
}

function getVersionString(object) {
	let string;
	if (object?.major) {
		string = object.major.toString();
		if (object.minor) {
			string += '.' + object.minor.toString();
			if (object.patch) {
				string += '.' + object.patch.toString();
			}
		}
	}

	return string;
}

function getVersionObject(string) {
	if (string) {
		const splt = string.split('.');
		return {
			major: splt[0] ? Math.trunc(Number(splt[0])) : undefined,
			minor: splt[1] ? Math.trunc(Number(splt[1])) : undefined,
			patch: splt[2] ? Math.trunc(Number(splt[2])) : undefined,
		};
	}

	return {};
}

export {getVersionObject, getVersionString, getAndroidVersion};
