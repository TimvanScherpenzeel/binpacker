// Native
import { lstatSync } from 'fs';
import { parse } from 'path';

/**
 * Get a file basename from a file path (without a file extension)
 *
 * @param filepath Input filepath
 */
export const getFileName = (filepath: string): string => parse(filepath).name;

/**
 * Get a file basename from a file path (without a file name and file extension)
 *
 * @param filepath Input filepath
 */
export const getFilePath = (filepath: string): string =>
  filepath.substring(0, filepath.lastIndexOf('/') + 1);

/**
 * Get a file extension from a file path
 *
 * @param filepath Input filepath
 */
export const getFileExtension = (filepath: string): string => parse(filepath).ext;

/**
 * Check if a file path is a directory
 *
 * @param filepath Input filepath
 */
export const isDirectory = (filepath: string): boolean => lstatSync(filepath).isDirectory();
