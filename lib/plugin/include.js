'use strict';

var fs = require('fs');
var File = require('vinyl');
var join = require('path').join;
var extend = require('extend');
var through = require('through2');
var winPath = require('../util').winPath;
var common = require('../common');
var getDepsPackage = common.getDepsPackage;
var getExtra = common.getExtra;
var PluginError = require('gulp-util').PluginError;
var debug = require('debug')('transport:include');

module.exports = function(opt) {
  opt = extend({}, opt);

  return through.obj(function(file, enc, cb) {
    var self = this;
    var base = file.base;
    var filepath = winPath(file.relative);

    var endFile = file.clone();
    endFile.dependentPath = file.path;
    endFile.contents = new Buffer('');

    var files;
    try {
      files = getFiles(filepath, opt);
    } catch(e) {
      return cb(new PluginError('include', e));
    }

    // file self
    debug('filepath:%s self', file.path);
    this.push(file);

    // file dependency
    files.forEach(function(filepath) {
      var f = createFile(filepath, base);
      f.dependentPath = file.path;
      debug('filepath:%s dependency', f.path);
      self.push(f);
    });

    // end file
    debug('filepath:%s end', endFile.path);
    this.push(endFile);
    cb();
  });
};

function getFiles(file, options) {
  var pkg = options.pkg, include = options.include || 'relative';
  file = pkg.files[file];

  var ignore = getDepsPackage(options.ignore, pkg);
  var extra = getExtra(file, pkg, options);

  return file.lookup(function(fileInfo) {
    var dependent = fileInfo.dependent;

    if (ignore.indexOf(fileInfo.pkg.id) > -1) {
      return false;
    }

    // css hack
    if (fileInfo.extension === 'css') {
      // ignore when css -> css
      if (dependent.extension === 'css') return false;
      // ignore when js -> css and js is not self
      if (include !== 'all' && dependent.extension === 'js' && !isSelf(dependent.pkg)) return false;

      return join(fileInfo.pkg.dest, fileInfo.filepath);
    }

    // just self, no dependencies
    if (include === 'self') {
      return false;
    }

    // include relative file in package
    if (include === 'relative' && pkg.name !== fileInfo.pkg.name) {
      return false;
    }

    return join(fileInfo.pkg.dest, fileInfo.filepath);
  }, extra);

  function isSelf(pkg_) {
    return pkg_.name === pkg.name;
  }
}

function createFile(filepath, base) {
  return new File({
    cwd: base,
    base: base,
    path: filepath,
    contents: fs.readFileSync(filepath)
  });
}
