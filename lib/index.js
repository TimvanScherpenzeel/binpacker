// Native
const fs = require('fs');

// Packer
const packer = require('packer');

// Arguments
const { input, output } = require('./argsHandler');

// Constants
const { SUPPORTED_INPUT_TYPES } = require('./constants');

// File loader
const fileLoader = require('./fileLoader');

// Utilities
const { getFileExtension } = require('./utilities');

const pack = () => {
	const inputFileExtension = getFileExtension(input);

	if (SUPPORTED_INPUT_TYPES.includes(inputFileExtension)) {
		fileLoader(input, 'utf8')
			.then((file) => {
				const packed = packer(file);

				fs.writeFile(output, packed, (error) => {
					if (!error) {
						console.log(`Written file to ${output}`);
					} else {
						console.error(error);
					}
				});
			})
			.catch((error) => {
				console.error(error);
			});
	} else {
		console.error(`${inputFileExtension} is not supported.`);
		console.error(`The supported file extensions are: [${SUPPORTED_INPUT_TYPES}]`);
	}
};

pack();
