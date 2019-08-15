// Vendor
import { ArgumentParser } from 'argparse';

// Package
import * as pkg from '../package.json';

/**
 * Create CLI arguments
 */
const createParserArguments = (): ICLIArgs => {
  const parser = new ArgumentParser({
    addHelp: true,
    description: pkg.description,
    version: pkg.version,
  });

  // File input flag
  parser.addArgument(['-i', '--input'], {
    help: 'Input file including path',
    required: false,
  });

  // File output flag
  parser.addArgument(['-o', '--output'], {
    help: 'Output location including path',
    required: true,
  });

  return parser.parseArgs();
};

export interface ICLIArgs {
  input: string;
  output: string;
}

export const CLIArgs = createParserArguments();
