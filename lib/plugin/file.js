'use strict';

var through = require('through2');

module.exports = function file(pkg) {
  return through.obj(function(gfile, enc, cb) {
    if (gfile.isNull()) return cb(null, gfile);
    if (gfile.isStream()) return cb(new Error('Streaming not supported.'));

    gfile.file = pkg.getFile(gfile.path) || null;
    cb(null, gfile);
  });
};
