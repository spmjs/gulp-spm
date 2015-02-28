'use strict';

var fs = require('fs');
var path = require('path');
var File = require('vinyl');
var imports = require('css-imports');
var resources = require('css-resources');
var debug = require('debug')('transport:css');
var util = require('../util');
var rename = require('rename');
var throwError = util.throwError;
var createStream = require('../common').createStream;
var join = path.join;
var dirname = path.dirname;
var basename = path.basename;
var relative = path.relative;

module.exports = function cssParser(options) {
  return createStream(options, 'css', parser);
};

function parser(gfile, options) {
  var imported = {}, depPkgs = {};
  var self = this;

  gfile.contents = new Buffer(transportFile(gfile.file));
  //replace filename with suffix
  var fileObj = rename.parse(gfile.path);
  fileObj.hash = gfile.file.hash;
  gfile.path = rename(fileObj, options.rename);
  return gfile;

  function transportFile(file) {
    imported[file.path] = true;
    var contents = fs.readFileSync(file.path);

    contents = resources(contents, function(item) {
      var dep = item.path;

      if (util.isLocal(dep)) {
        var depFilePath = join(dirname(file.path), dep);
        var depFileName = basename(dep);
        if (file.pkg.father) {
          depFileName = file.pkg.id.replace(/[@\.]/g, '_') + '_' + depFileName;
        }

        var f = new File({
          cwd: options.pkg.dest,
          base: options.pkg.dest,
          path: depFileName,
          contents: fs.readFileSync(depFilePath.split('?')[0])
        });
        f.file = {
          path: join(options.pkg.dest, depFileName),
          pkg: options.pkg
        };
        f.path = join(options.pkg.dest, depFileName.split('?')[0]);
        self.push(f);

        return 'url('+join(relative(dirname(gfile.path), options.pkg.dest), depFileName)+')';
      } else {
        return item.string;
      }
    });

    contents = imports(contents, function(item) {
      var dep = item.path, depFile;

      if (util.isRelative(dep)) {
        var depFilepath = join(dirname(file.relative), dep);
        depFile = file.pkg.files[depFilepath];
      } else {
        depFile = file.getDeps(dep);
        var depPkg = depFile.pkg;

        if (depFile.ignore) {
          return '';
        }

        // throw when css conflict
        var oldVersion = depPkgs[depPkg.name];
        if (oldVersion && oldVersion !== depPkg.version) {
          throwError('%s conflict with %s', depPkg.id, depPkg.name + '@' + oldVersion);
        } else {
          depPkgs[depPkg.name] = depPkg.version;
        }
      }

      // only import once
      if (imported[depFile.path]) {
        return '';
      }

      debug('from %s import %s', file.path, depFile.path);
      return transportFile(depFile);
    }).replace(/\n{2,}/g, '\n\n');

    return contents;
  }
}
