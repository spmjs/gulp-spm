'use strict';

var fs = require('fs');
var path = require('path');
var imports = require('css-imports');
var util = require('../util');
var createStream = util.createStream;
var join = path.join;
var dirname = path.dirname;

module.exports = function cssParser(options) {
  return createStream(options, 'css', parser);
};

function parser(file, options) {
  var imported = {};
  file.contents = new Buffer(transportFile(file, options.pkg, imported));
  return file;
}

function transportFile(file, pkg, imported) {
  var selfPath = file.path;
  imported[file.path] = file;

  return imports(file.contents, function(item) {
    var dep = item.path, pkg_, fullpath;

    if (dep.charAt(0) === '.') {
      pkg_ = pkg;
      fullpath = join(dirname(selfPath), dep);
    } else {
      pkg_ = pkg.dependencies[dep];
      fullpath = join(pkg_.dest, pkg_.main);
    }

    // only import once
    if (imported[fullpath]) {
      return '';
    }

    var file = {
      path: fullpath,
      contents: fs.readFileSync(fullpath)
    };
    imported[fullpath] = file;
    return transportFile(file, pkg_, imported);
  }).replace(/\n{2,}/g, '\n\n');
}

