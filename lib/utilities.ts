// Native
import fs from 'fs';
import path from 'path';

// Vendor
import glob from 'glob';

export const getFileName = (filepath: string): string => path.parse(filepath).name;

export const getFilePath = (filepath: string): string =>
  filepath.substring(0, filepath.lastIndexOf('/') + 1);

export const getFileExtension = (filepath: string): string => path.parse(filepath).ext;

export const isDirectory = (filepath: string): boolean => fs.lstatSync(filepath).isDirectory();

export const getDirectoriesByGlob = (root: string, cb: any): any => glob(`${root}/**/*`, cb);
