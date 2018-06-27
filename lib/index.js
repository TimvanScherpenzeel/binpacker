// Native
const fs = require('fs');
const path = require('path');

// Packer
const packer = require('./packer');

// Arguments
const { input, output } = require('./argsHandler');

// Constants
const { SUPPORTED_INPUT_TYPES } = require('./constants');

// File loader
const fileLoader = require('./fileLoader');

// Utilities
const { getFileExtension, isDirectory, getDirectoriesByGlob } = require('./utilities');

const getFiles = (inputDirectory) => {
	if (isDirectory(inputDirectory)) {
		return new Promise((resolve, reject) => {
			getDirectoriesByGlob(inputDirectory, (error, globList) => {
				if (error) {
					reject(error);
				}

				resolve(globList.filter(file => !isDirectory(path.resolve(file))));
			});
		});
	}
};

const pack = () => {
	getFiles(input).then((fileList) => {
		const files = fileList.map((file) => {
			const inputFileExtension = getFileExtension(file);

			if (SUPPORTED_INPUT_TYPES.includes(inputFileExtension)) {
				console.log(file);

				// load single file
				// create writeable buffer from the file
				// read the file length
				// check accompanying mime-type

				// return {
				//   name: file,
				//   length: 3000,
				//   type: type,
				//   data: data,
				// }

				return file;
			}

			console.warn(`\n${file} is not supported.`);
			console.warn(`The supported file extensions are: [${SUPPORTED_INPUT_TYPES}]\n`);
			return false;
		});

		console.log(files);

		// write binary file
		// write json file
		// be sure to gzip the binpack files (perhaps gzip base64?)
	});

	// fileList.forEach((file) => {
	// 	const inputFileExtension = getFileExtension(file);

	// 	if (SUPPORTED_INPUT_TYPES.includes(inputFileExtension)) {
	// 		console.log(file);

	// 		// fileLoader(input, 'utf8')
	// 		// 	.then((file) => {
	// 		// 		const packed = packer(file);
	// 		// 		fs.writeFile(output, packed, (error) => {
	// 		// 			if (!error) {
	// 		// 				console.log(`Written file to ${output}`);
	// 		// 			} else {
	// 		// 				console.error(error);
	// 		// 			}
	// 		// 		});
	// 		// 	})
	// 		// 	.catch((error) => {
	// 		// 		console.error(error);
	// 		// 	});
	// 	} else {
	// 		console.error(`${inputFileExtension} is not supported.`);
	// 		console.error(`The supported file extensions are: [${SUPPORTED_INPUT_TYPES}]`);
	// 	}
	// });
};

pack();
