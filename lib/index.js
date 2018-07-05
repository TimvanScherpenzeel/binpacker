// Native
const fs = require('fs');
const path = require('path');

// Vendor
const mimeTypes = require('mime-types');

// Arguments
const { input, output } = require('./argsHandler');

// Constants
const { SUPPORTED_INPUT_TYPES } = require('./constants');

// Utilities
const {
	getFileExtension,
	getFilename,
	getFilePath,
	isDirectory,
	getDirectoriesByGlob,
} = require('./utilities');

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

const resolveMimeType = (file) => {
	const fileExtension = getFileExtension(file);
	const mimeType = mimeTypes.lookup(fileExtension);

	return mimeType;
};

const pack = () => {
	getFiles(input).then((fileList) => {
		const buffers = [];
		const data = [];
		let bufferOffset = 0;

		fileList.forEach((file) => {
			const inputFileExtension = getFileExtension(file);

			if (SUPPORTED_INPUT_TYPES.includes(inputFileExtension)) {
				const mimeType = resolveMimeType(file);
				const fileSize = fs.statSync(file).size;
				const fileContent = fs.readFileSync(file);

				buffers.push(fileContent);
				data.push([path.parse(file).base, bufferOffset, bufferOffset + fileSize, mimeType]);

				bufferOffset += fileSize;
			} else {
				console.warn(`\n${file} is not supported.`);
				console.warn(`The supported file extensions are: [${SUPPORTED_INPUT_TYPES}]\n`);
			}
		});

		fs.writeFileSync(
			`${getFilePath(output)}${getFilename(output)}.binpack`,
			Buffer.concat(buffers),
		);
		console.log(`Wrote to ${getFilePath(output)}${getFilename(output)}.binpack`);

		fs.writeFileSync(`${getFilePath(output)}${getFilename(output)}.json`, JSON.stringify(data));
		console.log(`Wrote to ${getFilePath(output)}${getFilename(output)}.json`);

		// fs.writeFileSync(output)

		// console.log(files);

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
