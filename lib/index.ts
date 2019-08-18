// Native
import { readFileSync, statSync, writeFile } from 'fs';
import { parse, resolve as resolvePath } from 'path';

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
      glob(`${inputPath}/**/*`, (error: Error | null, globList: string[]): void => {
        if (error) {
          reject(error);
        }

        resolve(globList.filter((file: string): boolean => !isDirectory(resolvePath(file))));
      });
    });
  }

  if (getFileName(inputPath) === 'manifest' && getFileExtension(inputPath) === '.json') {
    return new Promise((resolve, reject): any => {
      const manifestContent = JSON.parse(readFileSync(inputPath, 'utf8'));
      const manifestFiles = manifestContent.manifest.map(
        (manifestEntry: { src: string }): string => `${manifestContent.path}${manifestEntry.src}`
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
        console.log('Processing the following files:\n');
      }

      const buffers: Buffer[] = [];
      const data: Array<{
        bufferEnd: number;
        bufferStart: number;
        mimeType: string;
        name: string;
      }> = [];
      let bufferOffset = 0;

      fileList.forEach(file => {
        if (args.verbose) {
          console.log(`- ${file}`);
        }

        const inputFileExtension = getFileExtension(file);

        if (SUPPORTED_INPUT_TYPES.includes(inputFileExtension)) {
          const mimeType = mimeTypes.lookup(inputFileExtension) || 'text/plain';
          const fileSize = statSync(file).size;
          const fileContent = readFileSync(file);

          buffers.push(fileContent);

          data.push({
            bufferEnd: bufferOffset + fileSize,
            bufferStart: bufferOffset,
            mimeType,
            name: parse(file).base,
          });

          bufferOffset += fileSize;
        } else {
          console.warn(`\n${file} is not supported and will not be included.`);
          console.warn(`The supported file extensions are: [${SUPPORTED_INPUT_TYPES}]\n`);
        }
      });

      // Pad the JSON data to 4-byte chunks
      let jsonData = JSON.stringify(data);
      const remainder = Buffer.byteLength(jsonData) % 4;
      jsonData = jsonData.padEnd(jsonData.length + (remainder === 0 ? 0 : 4 - remainder), ' ');

      if (args.verbose) {
        console.log(`\n${jsonData}: ${jsonData.length}`);
      }

      // Create the JSON and BIN buffer
      const jsonBuffer = Buffer.from(jsonData);
      const binaryBuffer = Buffer.concat(buffers);

      // Allocate buffer (Global header) + (JSON chunk header) + (JSON chunk) + (Binary chunk header) + (Binary chunk)
      const binpackBufferLength = 12 + 8 + jsonBuffer.length + 8 + binaryBuffer.length;
      const binpack = Buffer.alloc(binpackBufferLength);

      // Keep track of the internal byte offset
      let byteOffset = 0;

      // Write BINPACK magic
      binpack.writeUInt32LE(0x504e4942, 0); // BINP
      byteOffset += 4;

      // Write BINPACK version
      binpack.writeUInt32LE(1, byteOffset);
      byteOffset += 4;

      // Write BINPACK length
      binpack.writeUInt32LE(binpackBufferLength, byteOffset);
      byteOffset += 4;

      // Write JSON buffer length
      binpack.writeUInt32LE(jsonBuffer.length, byteOffset);
      byteOffset += 4;

      // Write JSON chunk magic
      binpack.writeUInt32LE(0x4e4f534a, byteOffset); // JSON
      byteOffset += 4;

      // Write JSON chunk
      jsonBuffer.copy(binpack, byteOffset);
      byteOffset += jsonBuffer.length;

      // Write BIN chunk length
      binpack.writeUInt32LE(binaryBuffer.length, byteOffset);
      byteOffset += 4;

      // Write BIN chunk magic
      binpack.writeUInt32LE(0x004e4942, byteOffset); // BIN
      byteOffset += 4;

      // Write BIN chunk
      binaryBuffer.copy(binpack, byteOffset);

      // Write the file to disk
      writeFile(
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
