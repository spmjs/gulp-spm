'use strict';

var fs = require('fs');
var join = require('path').join;
var File = require('vinyl');

module.exports = function createFile(base, path) {
  var fullpath = join(base, path);
  return new File({
    base: base,
    cwd: base,
    contents: fs.readFileSync(fullpath),
    path: fullpath
  });
};
