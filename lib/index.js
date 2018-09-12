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
  getFileExtension, getFilename, getFilePath, isDirectory, getDirectoriesByGlob,
} = require('./utilities');

const getFiles = (inputEntry) => {
  if (isDirectory(inputEntry)) {
    return new Promise((resolve, reject) => {
      getDirectoriesByGlob(inputEntry, (error, globList) => {
        if (error) {
          reject(error);
        }

        resolve(globList.filter(file => !isDirectory(path.resolve(file))));
      });
    });
  }

  if (getFilename(inputEntry) === 'manifest' && getFileExtension(inputEntry) === '.json') {
    return new Promise((resolve, reject) => {
      const manifestContent = JSON.parse(fs.readFileSync(inputEntry, 'utf8'));
      const manifestFiles = manifestContent.manifest.map(
        manifestEntry => `${manifestContent.path}${manifestEntry}`,
      );

      if (manifestFiles.length < 1) {
        reject(new Error('Manifest should contain one or more entries'));

        if (!manifestFiles) {
          reject(
            new Error(
              `Unable to read manifest in ${getFilePath(inputEntry)}${getFilename(
                inputEntry,
              )}${getFileExtension(inputEntry)}`,
            ),
          );
        }
      }

      resolve(manifestFiles);
    });
  }

  throw new Error('Input must either be a directory or a JSON configuration');
};

const resolveMimeType = (file) => {
  const fileExtension = getFileExtension(file);
  let mimeType = mimeTypes.lookup(fileExtension);

  if (!mimeType) {
    switch (fileExtension) {
      case '.dds':
      case '.pvr':
      case '.glb':
        mimeType = 'application/octet-stream';
        break;
      case '.hdr':
        mimeType = 'image/vnd.radiance';
        break;
      default:
        mimeType = 'text/plain';
        break;
    }
  }

  return mimeType;
};

const getJSONBufferPadded = (json) => {
  let string = JSON.stringify(json);

  const boundary = 4;
  const byteLength = Buffer.byteLength(string);
  const remainder = byteLength % boundary;
  const padding = remainder === 0 ? 0 : boundary - remainder;
  let whitespace = '';

  for (let i = 0; i < padding; i++) {
    whitespace += ' ';
  }

  string += whitespace;

  return Buffer.from(string);
};

const pack = () => {
  getFiles(input).then((fileList) => {
    console.log('Processing the following files:');

    const buffers = [];
    const data = [];
    let bufferOffset = 0;

    fileList.forEach((file) => {
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
        console.warn(`\n${file} is not supported and will not be included.`);
        console.warn(`The supported file extensions are: [${SUPPORTED_INPUT_TYPES}]\n`);
      }
    });

    const jsonBuffer = getJSONBufferPadded(data);
    const binaryBuffer = Buffer.concat(buffers);

    // Allocate buffer (Global header) + (JSON chunk header) + (JSON chunk) + (Binary chunk header) + (Binary chunk)
    const BINPACK_LENGTH = 12 + 8 + jsonBuffer.length + 8 + binaryBuffer.length;
    const binpack = Buffer.alloc(BINPACK_LENGTH);

    // Write binary header (magic, version, length)
    let byteOffset = 0;
    binpack.writeUInt32LE(0x504e4942); // BINP
    byteOffset += 4;
    binpack.writeUInt32LE(1, byteOffset);
    byteOffset += 4;
    binpack.writeUInt32LE(BINPACK_LENGTH, byteOffset);
    byteOffset += 4;

    // Write JSON chunk header (length, type)
    binpack.writeUInt32LE(jsonBuffer.length, byteOffset);
    byteOffset += 4;
    binpack.writeUInt32LE(0x4e4f534a, byteOffset); // JSON
    byteOffset += 4;

    // Write JSON chunk
    jsonBuffer.copy(binpack, byteOffset);
    byteOffset += jsonBuffer.length;

    // Write binary chunk header (length, type)
    binpack.writeUInt32LE(binaryBuffer.length, byteOffset);
    byteOffset += 4;
    binpack.writeUInt32LE(0x004e4942, byteOffset); // BIN
    byteOffset += 4;

    // Write binary chunk
    binaryBuffer.copy(binpack, byteOffset);

    fs.writeFileSync(`${getFilePath(output)}${getFilename(output)}${getFileExtension(output)}`, binpack);
    console.log(`\nWrote to ${getFilePath(output)}${getFilename(output)}${getFileExtension(output)}`);
  });
};

pack();
