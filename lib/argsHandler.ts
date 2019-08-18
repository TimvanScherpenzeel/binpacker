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
    required: true,
  });

  // File output flag
  parser.addArgument(['-o', '--output'], {
    help: 'Output location including path',
    required: true,
  });

  // Verbose logging
  parser.addArgument(['-vb', '--verbose'], {
    action: 'storeTrue',
    help: 'Enable verbose logging',
    required: false,
  });

  return parser.parseArgs();
};

export interface ICLIArgs {
  input: string;
  output: string;
  verbose?: boolean;
}

export const CLIArgs = createParserArguments();
