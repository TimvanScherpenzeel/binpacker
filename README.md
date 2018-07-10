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

## File structure

A `Binpacker` file has the following structure (very similar to the [GLB File Format Specification](https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#glb-file-format-specification)):

- A 12-byte header

The header consists out a magic byte `BINP`, a version number `1` and the total file length.

- A single JSON chunk header marked by `JSON`

The JSON chunk header has a field that marks the length of the JSON chunk and a type marked `JSON`.

- A single JSON chunk

The JSON chunk contains a stringified JSON description of the processed files: `name`, `bufferStart`, `bufferEnd` and `mimeType`. The difference between `bufferStart` and `bufferEnd` describe the length of the file. This length is used to extract the correct amount of bytes per file from the binary chunk that follows next.

- A single binary chunk header marked by `BIN`

The binary chunk header has a field that marks the length of the binary chunk and a type marked `BIN`.

- A single binary chunk

The binary chunk contains a single `Uint8Array` typed array buffer that has been constructed out of concatenated files. Using the data described in the JSON chunk one can correctly extract the file from the binary chunk.

## Flags

### Required

    -i, --input [example: ./input] [required]

    Input takes a single entry point folder and will glob collect files from child folders

    -o, --output [example: ./output/example.binpack] [required]

    Output takes the desired filename in optionally a desired existing directory (is not created for you)

## License

`binpacker` is released under the [MIT license](https://raw.githubusercontent.com/TimvanScherpenzeel/binpacker/master/LICENSE).
