'use strict';

var fs = require('fs');
var join = require('path').join;
var File = require('vinyl');

module.exports = function createFile(pkg, path, file) {
  var fullpath = join(pkg.dest, path);
  var gfile = new File({
    base: pkg.dest,
    cwd: pkg.dest,
    contents: fs.readFileSync(fullpath),
    path: fullpath
  });
  gfile.file = file || pkg.files[path];
  return gfile;
};
