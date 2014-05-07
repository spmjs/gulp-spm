'use strict';

var fs = require('fs');
var path = require('path');
var join = path.join;
var extname = path.extname;
var relative = path.relative;
var dirname = path.dirname;
var _ = require('lodash');
var through = require('through2');
var PluginError = require('gulp-util').PluginError;
var debug = require('debug')('transport:util');
var renameFile = require('rename');

/*
  exports
*/

exports.transportId = transportId;
exports.transportDeps = transportDeps;
exports.generateId = generateId;
exports.generateDeps = generateDeps;
exports.getFileInfo = getFileInfo;
exports.template = template;
exports.extendOption = extendOption;
exports.createStream = createStream;
exports.isRelative = isRelative;
exports.hideExt = hideExt;
exports.rename = rename;

/*
  Transport cmd id

  required options: idleading, cwd, rename
*/

function transportId(filepath, pkg, options, base) {
  options = extendOption(options);
  if (isRelative(filepath)) {
    debug('transport relative id(%s) of basepath(%s)', filepath, base);
    if (!base) throw new PluginError('transportId', 'no base path of ' + filepath);
    filepath = join(dirname(base), filepath);
    if (isRelative(filepath)) throw new PluginError('transportId', filepath + ' is out of bound');
  }

  var prefix = template(options.idleading, pkg);

  // rename with fullpath
  filepath = join(options.cwd, filepath);
  filepath = rename(filepath, options);
  filepath = hideExt(filepath);
  filepath = relative(options.cwd, filepath);

  var id = join(prefix, filepath);
  debug('transport id(%s) of pakcage %s', id, pkg.id);
  return id;
}

/*
  Transport cmd dependencies, it will get deep dependencies of the file,
  but will ignore relative module of the dependent package.

  required options: idleading, cwd, rename, ignore
*/

function transportDeps(filepath, pkg, options) {
  options = extendOption(options);
  if (!pkg.files[filepath]) {
    throw new PluginError('transportDeps', filepath + ' is not included in ' + Object.keys(pkg.files));
  }

  var fileDeps = pkg.files[filepath].dependencies;

  var deps = _(fileDeps)
    .map(function(file) {
      if (isRelative(file)) {
        var fullpath = extname(file) ? file : (file + '.js');
        fullpath = join(pkg.dest, dirname(filepath), fullpath);
        if (!fs.existsSync(fullpath)) {
          throw new Error(fullpath + ' not found');
        }
        return transportId(file, pkg, options, filepath);
      } else {
        var pkg_ = pkg.dependencies[file];
        if (!pkg_) {
          // not transport when no package
          throw new Error('package ' + file + ' not found');
        }
        return findPackageDeps(pkg_);
      }
    })
    .flatten()
    .uniq()
    .value();

  debug('transport deps(%s) of pakcage %s', deps, pkg.id);
  return deps;

  function findPackageDeps(pkg) {
    var entry;
    if (~options.ignore.indexOf(pkg.name)) {
      entry = pkg.name;
    } else {
      entry = transportId(pkg.main, pkg, options);
    }

    // hack: don't return css's dependencies
    if (/\.css$/.test(entry)) {
      return entry;
    }

    return Object.keys(pkg.dependencies)
      .map(function(key) {
        var pkg_ = pkg.dependencies[key];
        return findPackageDeps(pkg_);
      })
      .concat(entry);
  }
}

/*
  Generate cmd id from vinyl object

  required options: pkg, idleading, cwd, rename
*/

function generateId(file, options) {
  var fInfo = getFileInfo(file, options.pkg);
  return transportId(fInfo.filepath, fInfo.pkg, options);
}

/*
  Generate cmd dependency from vinyl object

  required options: pkg, idleading, cwd, rename, ignore
*/

function generateDeps(file, options) {
  var fInfo = getFileInfo(file, options.pkg);
  return transportDeps(fInfo.filepath, fInfo.pkg, options)
    .map(function(item) {
      return '"' + item + '"';
    }).join(',');
}

/*
  Simple template

  ```
  var tpl = '{{name}}/{{version}}';
  util.template(tpl, {name:'base', version: '1.0.0'});
  ```
*/

function template(format, data) {
  if (!format) return '';
  return format.replace(/{{([a-z]*)}}/g, function(all, match) {
    return data[match] || '';
  });
}

/*
  Set option defaults
*/

function extendOption(options) {
  var opt = {
    // pkg info parsed by father
    pkg : null,

    // omit the given dependencies when transport
    ignore: [],

    // id prefix template that can use pkg as it's data
    idleading: '{{name}}/{{version}}',

    cwd: process.cwd()
  };

  if (!options) return opt;

  for (var key in options) {
    opt[key] = options[key];
  }

  return opt;
}

/*
  Create a stream for parser in lib/parser
*/

function createStream(options, type, parser) {
  options = extendOption(options);
  if (!options.pkg) {
    throw new PluginError('transport', 'pkg missing');
  }

  var pluginName = 'transport:' + type;

  return through.obj(function(file, enc, callback) {
    if (file.isStream()) return callback(new PluginError(pluginName, 'Streaming not supported.'));

    var ext = extname(file.path).substring(1);
    if (ext !== type) {
      return callback(new PluginError(pluginName, 'extension "' + ext + '" not supported.'));
    }

    try {
      file = parser(file, options);
    } catch(e) {
      this.emit('error', e);
      return callback();
    }

    // replace filename with suffix
    file.path = rename(file.path, options);

    this.push(file);
    return callback();
  });
}

/*
  Hide .js if exists
*/

function hideExt(filepath) {
  return extname(filepath) === '.js' ? filepath.replace(/\.js$/, '') : filepath;
}

/*
  Test filepath is relative path or not
*/

function isRelative(filepath) {
  return filepath.charAt(0) === '.';
}

/*
  Rename file, more info see https://github.com/popomore/rename

  E.g. rename('a.js', {suffix: '-debug'}) -> a-debug.js
*/

function rename(filepath, options) {
  if (options.rename) {
    try {
      if (!extname(filepath)) {
        filepath = filepath + '.js';
      }
      filepath = renameFile(filepath, options.rename);
    } catch(e) {
      debug('rename %s error %s', filepath, e.message);
    }
  }
  return filepath;
}

/*
  Get filepath and pkg from vinyl object, attempt to find
  from dependent package if current package don't match.
*/

function getFileInfo(file, pkg) {
  // hack file.path for gulp-rev
  var filepath = relative(pkg.dest, file.revOrigPath || file.path);

  // if specified filepath is not in pkg.files, then find it in pkg.dependencies
  if (!pkg.files[filepath]) {
    var hasFound = false, pkgs = pkg.getPackages();
    for (var i in pkgs) {
      var p = pkgs[i];
      if (~file.path.indexOf(p.dest)) {
        filepath = relative(p.dest, file.path);
        pkg = p;
        hasFound = true;
        break;
      }
    }
    if (!hasFound) {
      throw new PluginError('getFileInfo', 'not found ' + filepath + ' of pkg ' + pkg.id);
    }
  }

  debug('found fileInfo filepath(%s) pkg(%s)', filepath, pkg.id);
  return {
    filepath: filepath,
    pkg: pkg
  };
}
