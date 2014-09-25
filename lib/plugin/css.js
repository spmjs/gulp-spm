'use strict';

var fs = require('fs');
var path = require('path');
var imports = require('css-imports');
var debug = require('debug')('transport:css');
var PluginError = require('gulp-util').PluginError;
var util = require('../util');
var rename = util.rename;
var createStream = require('../common').createStream;
var getFile = require('../common').getFile;
var join = path.join;
var dirname = path.dirname;

module.exports = function cssParser(options) {
  return createStream(options, 'css', parser);
};

function parser(gfile, options) {
  var imported = {}, deps = {};


  gfile.contents = new Buffer(transportFile(gfile, gfile.contents, options.pkg));
  //replace filename with suffix
  gfile.path = rename(gfile, options);
  return gfile;

  function transportFile(gfile, contents, pkg) {
    var file = getFile(gfile, pkg);
    imported[file.fullpath] = true;

    return imports(contents, function(item) {
      var dep = item.path, pkg_, filepath;

      if (util.isRelative(dep)) {
        pkg_ = file.pkg;
        filepath = join(dirname(file.path), dep);
      } else {
        var depFile = file.getDeps(dep);
        pkg_ = depFile.pkg;
        filepath = depFile.path;

        if (options.ignore.indexOf(pkg_.name) !== -1) {
          return '';
        }

        // throw when css conflict
        var oldVersion = deps[pkg_.name];
        if (oldVersion && oldVersion !== pkg_.version) {
          var oldId = pkg_.name + '@' + oldVersion;
          throw new PluginError('transport:css', pkg_.id + ' conflict with ' + oldId);
        } else {
          deps[pkg_.name] = pkg_.version;
        }
      }

      // only import once
      var fullpath = join(pkg_.dest, filepath);
      if (imported[fullpath]) {
        return '';
      }

      debug('from %s import %s', file.fullpath, fullpath);
      return transportFile(fullpath, fs.readFileSync(fullpath), pkg_);
    }).replace(/\n{2,}/g, '\n\n');
  }
}
