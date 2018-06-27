// Native
const path = require('path');

const utilities = {
	getFileExtension: filename => path.parse(filename).ext,
};

module.exports = utilities;
