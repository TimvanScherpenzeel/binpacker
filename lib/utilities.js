// Native
const fs = require('fs');
const path = require('path');

// Vendor
const glob = require('glob');

const utilities = {
  getFilePath: filename => filename.substring(0, filename.lastIndexOf('/') + 1),
  getFilename: filename => path.parse(filename).name,
  getFileExtension: filename => path.parse(filename).ext,
  isDirectory: filepath => fs.lstatSync(filepath).isDirectory(),
  getDirectoriesByGlob: (root, cb) => glob(`${root}/**/*`, cb),
};

module.exports = utilities;
