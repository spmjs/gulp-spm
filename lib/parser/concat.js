'use strict';

var extend = require('extend');
var through = require('through2');

module.exports = function(opt) {
  opt = extend({}, opt);

  var fileCache;
  var bufCache;

  return through.obj(function(file, enc, cb) {

    if (isStart(file)) {
      fileCache = file;
      bufCache = file.contents.toString();
      return cb();
    }

    if (isEnd(file)) {
      fileCache.contents = new Buffer(bufCache);
      this.push(fileCache);
      fileCache = null;
      bufCache = null;
      return cb();
    }

    bufCache += file.contents.toString();
    cb();
  });
};

function isStart(file) {
  return !file.dependentPath;
}

function isEnd(file) {
  return file.dependentPath && file.dependentPath === file.path;
}
