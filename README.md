# Binpacker

[![npm version](https://badge.fury.io/js/%40timvanscherpenzeel%2Fbinpacker.svg)](https://www.npmjs.com/package/@timvanscherpenzeel/binpacker)

CLI tool for packing multiple files into a single Binpack binary in order to save network requests in the browser.
You can use `Binpacker` as an efficient replacement for spritesheets.

Inspired by [GLB File Format Specification](https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#glb-file-format-specification), [MM.Loader](https://github.com/MM56/MM.Loader), [MM.Packer](https://github.com/MM56/mm-packer), [Magipack.js](https://github.com/keitakun/Magipack.js) and [this Twitter thread](https://twitter.com/tvscherpenzeel/status/1015124298812489728).

## Live demo

[Live demo](https://timvanscherpenzeel.github.io/binpacker).

## Installation

Make sure you have [Node.js](http://nodejs.org/) installed.

```sh
$ npm install -g --save @timvanscherpenzeel/binpacker
```

## CLI Usage

```sh
$ node ./bin/binpacker.js -i ./input -o ./output/example.binpack -vb
```

```sh
$ node ./bin/binpacker.js -i ./input/manifest.json -o ./output/example.binpack -vb
```

## Manifest structure

```
{
  "path": "./input/",
  "manifest": [
    {
      "src": "icon-twitter.svg"
    },
    {
      "src": "spritesheet (2).json"
    },
    {
      "src": "texture.jpg"
    }
  ]
}
```

## File structure

A `.binpack` file has the following structure (very similar to the [GLB File Format Specification](https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#glb-file-format-specification)):

![file_structure](/docs/file_structure.png?raw=true)

_Figure from the [GLB File Format Specification](https://github.com/KhronosGroup/glTF/tree/master/specification/2.0)._

### Endianness

`Binpack` is little endian.

### 12-byte header

The 12-byte header consists of three 4-byte entries:

```
uint32 magic
uint32 version
uint32 length
```

- `magic` equals `0x504e4942`. It is ASCII string `BINP`, and can be used to identify data as `Binpack`.

- `version` indicates the version of the `Binpack`. This specification defines version 1.

- `length` is the total length of the `Binpack` file, including Header and all Chunks, in bytes.

### JSON chunk header

_A single JSON chunk header_

The JSON chunk header has a field that marks the length of the JSON chunk (`uint32 chunkLength`) and a type (`uint32 chunkType`) marked `JSON` in ASCII.

### JSON chunk

_A single JSON chunk_

The JSON chunk (`ubyte[] chunkData`) contains a stringified JSON description of the processed files: `name`, `bufferStart`, `bufferEnd` and `mimeType`. The difference between `bufferStart` and `bufferEnd` describe the length of the file. This length is used to extract the correct amount of bytes per file from the binary chunk that follows next.

### Binary chunk header

_A single binary chunk header_

The binary chunk header has a field that marks the length of the binary chunk (`uint32 chunkLength`) and a type (`uint32 chunkType`) marked `BIN` in ASCII.

### Binary chunk

_A single binary chunk_

The binary chunk (`ubyte[] chunkData`) contains a single `Uint8Array` typed array buffer that has been constructed out of concatenated files. Using the data described in the JSON chunk one can correctly extract the file from the binary chunk.

## Flags

### Required

    -i, --input [example: ./input (glob) or ./input/manifest.json (manifest)] [required]
    -o, --output [example: ./output/example.binpack] [required]

### Optional

    -vb, --verbose [true / false, default: false] [not required]

## License

My work is released under the [MIT license](https://raw.githubusercontent.com/TimvanScherpenzeel/binpacker/master/LICENSE).
