# Binpacker

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

![file_structure](/docs/file_structure.png?raw=true)

### Header

_A 12-byte header_

The 12-byte header consists of three 4-byte entries:

```
uint32 magic
uint32 version
uint32 length
```

- `magic` equals `0x504e4942`. It is ASCII string `BINP`, and can be used to identify data as Binpacker.

- `version` indicates the version of the Binpacker. This specification defines version 1.

- `length` is the total length of the Binpacker file, including Header and all Chunks, in bytes.

### JSON chunk header

_A single JSON chunk header marked by `JSON` in ASCII (`uint32 chunkLength`, `uint32 chunkType`)_

The JSON chunk header has a field that marks the length of the JSON chunk and a type marked `JSON` in ASCII.

### JSON chunk

_A single JSON chunk (`ubyte[] chunkData`)_

The JSON chunk contains a stringified JSON description of the processed files: `name`, `bufferStart`, `bufferEnd` and `mimeType`. The difference between `bufferStart` and `bufferEnd` describe the length of the file. This length is used to extract the correct amount of bytes per file from the binary chunk that follows next.

### Binary chunk header

_A single binary chunk header marked by `BIN` in ASCII (`uint32 chunkLength`, `uint32 chunkType`)_

The binary chunk header has a field that marks the length of the binary chunk and a type marked `BIN` in ASCII.

### Binary chunk

_A single binary chunk (`ubyte[] chunkData`)_

The binary chunk contains a single `Uint8Array` typed array buffer that has been constructed out of concatenated files. Using the data described in the JSON chunk one can correctly extract the file from the binary chunk.

## Flags

### Required

    -i, --input [example: ./input] [required]

    Input takes a single entry point folder and will glob collect files from child folders

    -o, --output [example: ./output/example.binpack] [required]

    Output takes the desired filename in optionally a desired existing directory (is not created for you)

## License

`binpacker` is released under the [MIT license](https://raw.githubusercontent.com/TimvanScherpenzeel/binpacker/master/LICENSE).
