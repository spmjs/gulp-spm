'use strict';

var fs = require('fs');
var File = require('vinyl');
var join = require('path').join;
var dirname = require('path').dirname;
var extname = require('path').extname;
var extend = require('extend');
var through = require('through2');
var transportDeps = require('../common').transportDeps;

module.exports = function(opt) {
  opt = extend({}, opt);

  return through.obj(function(file, enc, cb) {
    var self = this;
    var base = file.base;
    var filepath = file.relative;
    var files = getFiles(filepath, opt);

    // file self
    this.push(file);

    // file dependency
    files.forEach(function(filepath) {
      var f = createFile(filepath, base);
      f.dependentPath = file.path;
      self.push(f);
    });

    // end file
    var endFile = file.clone();
    endFile.dependentPath = file.path;
    endFile.contents = new Buffer('');
    this.push(endFile);
    cb();
  });
};

function createFile(filepath, base) {
  return new File({
    cwd: base,
    base: base,
    path: filepath,
    contents: fs.readFileSync(filepath)
  });
}

function getFiles(file, options) {
  var pkg = options.pkg, include = options.include;

  switch(include) {
    case 'self':
      return getSelf(file, pkg, options);
    case 'all':
    case 'standalone':
      return getAll(file, pkg, options);
    default:
      return getRelative(file, pkg);
  }
}

function getAll(file, pkg, options) {
  var files = [], deps = pkg.dependencies;
  if (options && options.ignore) {
    options.ignore.forEach(function(i) {
      delete deps[i];
    });
  }
  pkg.files[file].dependencies
    .forEach(function(name) {
      if (/^\./.test(name)) {
        var fileTmp = join(dirname(file), name);
        files.push(resolve(fileTmp, pkg));
      } else {
        var p = deps[name];
        if (p) {
          files.push(join(p.dest, p.main));
          if (!/\.css$/.test(p.main)) {
            files = files.concat(getAll(p.main, p, options));
          }
        }
      }
    });
  return files.filter(function(item, index, arr) {
    return index === arr.indexOf(item);
  });
}

function getRelative(file, pkg) {
  var files = [], deps = pkg.dependencies;
  pkg.files[file].dependencies
    .forEach(function(name) {
      if (name.charAt(0) === '.') {
        var fileTmp = join(dirname(file), name);
        files.push(resolve(fileTmp, pkg));
      } else {
        var p = deps[name];
        if (p && /\.css$/.test(p.main)) {
          files.push(join(p.dest, p.main));
        }
      }
    });
  return files.filter(function(item, index, arr) {
    return index === arr.indexOf(item);
  });
}

function getSelf(file, pkg, options) {
  var idleading = options.idleading;
  options.idleading = function(filepath, pkg) {
    return pkg.dest;
  };
  var deps = transportDeps(file, pkg, options);
  var files = deps.filter(function(file) {
    return /\.css\.js$/.test(file);
  }).map(function(file) {
    return file.replace(/\.js$/, '');
  });
  options.idleading = idleading;
  return files;
}

function resolve(file, pkg) {
  file = extname(file) ? file : file + '.js';
  return join(pkg.dest, file);
}

