// Vendor
const { ArgumentParser } = require('argparse');

// Package
const pkg = require('../package.json');

const createParserArguments = () => {
	const parser = new ArgumentParser({
		version: pkg.version,
		addHelp: true,
		description: pkg.description,
	});

	// File or directory input flag
	parser.addArgument(['-i', '--input'], {
		help: 'Input file including path or input folder to recursively get input files from',
		required: true,
	});

	// File or directory output flag
	parser.addArgument(['-o', '--output'], {
		help: 'Output file including path',
		required: true,
	});

	const args = parser.parseArgs();

	return args;
};

const args = createParserArguments();

module.exports = args;
