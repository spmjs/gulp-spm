'use strict';

var fs = require('fs');
var path = require('path');
var imports = require('css-imports');
var debug = require('debug')('transport:css');
var PluginError = require('gulp-util').PluginError;
var util = require('../util');
var createStream = util.createStream;
var join = path.join;
var dirname = path.dirname;

module.exports = function cssParser(options) {
  return createStream(options, 'css', parser);
};

function parser(file, options) {
  var imported = {}, deps = {};
  file.contents = new Buffer(transportFile(file, options.pkg));
  return file;

  function transportFile(file, pkg) {
    var selfPath = file.path;
    imported[file.path] = file;

    return imports(file.contents, function(item) {
      var dep = item.path, pkg_, fullpath;

      if (util.isRelative(dep)) {
        pkg_ = pkg;
        fullpath = join(dirname(selfPath), dep);
      } else {
        // ignore dependency
        if (~options.ignore.indexOf(dep)) {
          return '';
        }

        pkg_ = pkg.dependencies[dep];

        // throw when dependent package not exists
        if (!pkg_) {
          throw new PluginError('transport:css', 'package ' + dep + ' not exists');
        }

        // throw when css conflict
        var oldVersion = deps[pkg_.name];
        if (oldVersion && oldVersion !== pkg_.version) {
          var oldId = pkg_.name + '@' + oldVersion;
          throw new PluginError('transport:css', pkg_.id + ' conflict with ' + oldId);
        } else {
          deps[pkg_.name] = pkg_.version;
        }

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
      debug('from %s import %s', selfPath, fullpath);
      imported[fullpath] = file;
      return transportFile(file, pkg_);
    }).replace(/\n{2,}/g, '\n\n');
  }
}
