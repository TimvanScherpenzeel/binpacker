// Native
const fs = require('fs');
const path = require('path');

const package = require('../package.json');

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

const getFiles = inputDirectory => {
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

const resolveMimeType = file => {
	const fileExtension = getFileExtension(file);
	const mimeType = mimeTypes.lookup(fileExtension);

	return mimeType;
};

const pack = () => {
	getFiles(input).then(fileList => {
		console.log('Processing the following files:\n');

		const buffers = [];
		const data = [];
		let bufferOffset = 0;

		fileList.forEach(file => {
			console.log(`- ${file}`);

			const inputFileExtension = getFileExtension(file);

			if (SUPPORTED_INPUT_TYPES.includes(inputFileExtension)) {
				const mimeType = resolveMimeType(file);
				const fileSize = fs.statSync(file).size;
				const fileContent = fs.readFileSync(file);

				buffers.push(fileContent);
				data.push({
					name: path.parse(file).base,
					bufferStart: bufferOffset,
					bufferEnd: bufferOffset + fileSize,
					mimeType,
				});

				bufferOffset += fileSize;
			} else {
				console.warn(`\n${file} is not supported.`);
				console.warn(`The supported file extensions are: [${SUPPORTED_INPUT_TYPES}]\n`);
			}
		});

		const stringifiedJSON = JSON.stringify(data);
		const mergedBuffers = Buffer.concat(buffers);
		console.log(`\nTotal JSON file length: ${stringifiedJSON.length}`);
		console.log(`Total Binpack file length: ${mergedBuffers.length}`);

		fs.writeFileSync(`${getFilePath(output)}${getFilename(output)}.binpack`, mergedBuffers);
		console.log(`\nWrote to ${getFilePath(output)}${getFilename(output)}.binpack`);

		fs.writeFileSync(`${getFilePath(output)}${getFilename(output)}.json`, stringifiedJSON);
		console.log(`Wrote to ${getFilePath(output)}${getFilename(output)}.json`);
	});
};

pack();
