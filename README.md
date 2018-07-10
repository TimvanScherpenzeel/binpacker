# Binpacker

[![npm version](https://badge.fury.io/js/binpacker.svg)](https://badge.fury.io/js/binpacker)
[![dependencies](https://david-dm.org/timvanscherpenzeel/binpacker.svg)](https://david-dm.org/timvanscherpenzeel/binpacker)
[![devDependencies](https://david-dm.org/timvanscherpenzeel/binpacker/dev-status.svg)](https://david-dm.org/timvanscherpenzeel/binpacker#info=devDependencies)

CLI tool for packing multiple files into a single binary in order to save network requests in the browser.

## Installation

```sh
$ npm install -g --save binpacker
```

## Example

```sh
$ node ./bin/binpacker.js -i ./input -o ./output/example.binpack
```

## Flags

### Required

    -i, --input [example: ./input] [required]

    Input takes a single entry point folder and will glob collect files from child folders

    -o, --output [example: ./output/example.binpack] [required]

    Output takes the desired filename in optionally a desired existing directory (is not created for you)

## Licence

`binpacker` is released under the [MIT licence](https://raw.githubusercontent.com/TimvanScherpenzeel/binpacker/master/LICENSE).
