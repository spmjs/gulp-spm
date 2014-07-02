'use strict';

var extend = require('extend');
var through = require('through2');
var debug = require('debug')('transport:concat');

module.exports = function(opt) {
  opt = extend({}, opt);

  var fileCache;
  var bufCache;

  return through.obj(function(file, enc, cb) {

    if (isStart(file)) {
      debug('filepath:%s start', file.path);
      fileCache = file;
      bufCache = file.contents.toString();
      return cb();
    }

    if (isEnd(file)) {
      debug('filepath:%s end', file.path);
      fileCache.contents = new Buffer(bufCache);
      this.push(fileCache);
      fileCache = null;
      bufCache = null;
      return cb();
    }

    debug('filepath:%s with dependentPath %s', file.path, file.dependentPath);
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
