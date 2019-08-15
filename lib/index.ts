// Native
import fs from 'fs';
import path from 'path';

// Vendor
import glob from 'glob';
import mimeTypes from 'mime-types';

// Arguments
import { ICLIArgs } from './argsHandler';

// Constants
import { SUPPORTED_INPUT_TYPES } from './constants';

// Utilities
import { getFileExtension, getFileName, getFilePath, isDirectory } from './utilities';

/**
 * Get a recursive listing of files either by a manifest.json file or input directory
 *
 * @param inputPath Input path
 */
const getFileList = (inputPath: string): Promise<string[]> => {
  if (isDirectory(inputPath)) {
    return new Promise((resolve, reject): any => {
      glob(`${inputPath}/**/*`, (error: Error | null, globList: any): void => {
        if (error) {
          reject(error);
        }

        resolve(globList.filter((file: string): boolean => !isDirectory(path.resolve(file))));
      });
    });
  }

  if (getFileName(inputPath) === 'manifest' && getFileExtension(inputPath) === '.json') {
    return new Promise((resolve, reject): any => {
      const manifestContent = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
      const manifestFiles = manifestContent.manifest.map(
        (manifestEntry: string): string => `${manifestContent.path}${manifestEntry}`
      );

      if (manifestFiles.length < 1) {
        reject(new Error('Manifest should contain one or more entries'));

        if (!manifestFiles) {
          reject(
            new Error(
              `Unable to read manifest in ${getFilePath(inputPath)}${getFileName(
                inputPath
              )}${getFileExtension(inputPath)}`
            )
          );
        }
      }

      resolve(manifestFiles);
    });
  }

  throw new Error('Input must either be a directory or a JSON configuration');
};

/**
 * Get the matching mimetype based on file extension
 *
 * @param inputPath Path to file
 */
const getMimeType = (inputPath: string): string => {
  const fileExtension = getFileExtension(inputPath);
  let mimeType = mimeTypes.lookup(fileExtension);

  if (!mimeType) {
    switch (fileExtension) {
      case '.dds':
      case '.pvr':
      case '.glb':
        mimeType = 'application/octet-stream';
        break;
      default:
        mimeType = 'text/plain';
        break;
    }
  }

  return mimeType;
};

/**
 * Pad a JSON buffer to make sure it is 4-byte aligned
 *
 * @param inputData Input data
 */
const getJSONBufferPadded = (inputData: string[]): Buffer => {
  let str = JSON.stringify(inputData);

  const boundary = 4;
  const byteLength = Buffer.byteLength(str);
  const remainder = byteLength % boundary;
  const padding = remainder === 0 ? 0 : boundary - remainder;
  let whitespace = '';

  for (let i = 0; i < padding; i++) {
    whitespace += ' ';
  }

  str += whitespace;

  return Buffer.from(str);
};

/**
 * Pack a files into a single binpack format
 */
export const pack = (CLIArgs?: ICLIArgs): Promise<any> => {
  let args: ICLIArgs;

  if (!CLIArgs) {
    args = require('./argsHandler').CLIArgs;
  } else {
    args = CLIArgs;
  }

  return new Promise((resolve): void => {
    getFileList(args.input).then(fileList => {
      if (args.verbose) {
        console.log('Processing the following files:');
      }

      const buffers: any[] = [];
      const data: any[] = [];
      let bufferOffset = 0;

      fileList.forEach(file => {
        if (args.verbose) {
          console.log(`- ${file}`);
        }

        const inputFileExtension = getFileExtension(file);

        if (SUPPORTED_INPUT_TYPES.includes(inputFileExtension)) {
          const mimeType = getMimeType(file);
          const fileSize = fs.statSync(file).size;
          const fileContent = fs.readFileSync(file);

          buffers.push(fileContent);
          data.push({
            bufferEnd: bufferOffset + fileSize,
            bufferStart: bufferOffset,
            mimeType,
            name: path.parse(file).base,
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
      binpack.writeUInt32LE(0x504e4942, 0); // BINP
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

      fs.writeFile(
        `${getFilePath(args.output)}${getFileName(args.output)}${getFileExtension(args.output)}`,
        binpack,
        () => {
          if (args.verbose) {
            console.log(
              `\nWrote to ${getFilePath(args.output)}${getFileName(args.output)}${getFileExtension(
                args.output
              )}`
            );
          }

          resolve();
        }
      );
    });
  });
};
