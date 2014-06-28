'use strict';

var fs = require('fs');
var path = require('path');
var join = path.join;
var extname = path.extname;
var relative = path.relative;
var _ = require('lodash');
var through = require('through2');
var PluginError = require('gulp-util').PluginError;
var debug = require('debug')('transport:util');

var util = require('./util');
var template = util.template;
var extendOption = util.extendOption;
var isRelative = util.isRelative;
var hideExt = util.hideExt;
var addExt = util.addExt;
var rename = util.rename;
var resolvePath = util.resolvePath;


/*
  exports
*/

exports.transportId = transportId;
exports.transportDeps = transportDeps;
exports.generateId = generateId;
exports.generateDeps = generateDeps;
exports.getFileInfo = getFileInfo;
exports.createStream = createStream;
exports.getStyleId = getStyleId;

/*
  Transport cmd id

  - filepath: file path based on package
  - pkg: package info parsed by father
  - required options: idleading, rename
*/

function transportId(filepath, pkg, options) {
  options = extendOption(options);
  if (isRelative(filepath)) {
    throw new PluginError('transportId', 'do not support relative path');
  }

  var idleading = resolveIdleading(options.idleading, filepath, pkg);
  var prefix = template(idleading, pkg);

  // rename with fullpath
  filepath = join(pkg.dest, filepath);
  filepath = addExt(filepath);

  filepath = rename(filepath, options);

  filepath = relative(pkg.dest, filepath);
  filepath = hideExt(filepath);

  // seajs has hacked css before 3.0.0
  // https://github.com/seajs/seajs/blob/2.2.1/src/util-path.js#L49
  // demo https://github.com/popomore/seajs-test/tree/master/css-deps
  if (extname(filepath) === '.css') {
    filepath += '.js';
  }

  var id = join(prefix, filepath).replace(/\\/g, '/');
  debug('transport id(%s) of pakcage %s', id, pkg.id);
  return id;
}

/*
  Transport cmd dependencies, it will get deep dependencies of the file,
  but will ignore relative module of the dependent package.

  - filepath: file path based on package
  - pkg: package info parsed by father
  - required options: idleading, rename, ignore
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
        file = resolvePath(addExt(file), filepath);
        // throw when file doesn't exist
        checkPath(join(pkg.dest, file));
        return transportId(file, pkg, options);
      } else {
        return findPackageDeps(file, pkg);
      }
    })
    .flatten()
    .uniq()
    .value();

  debug('transport deps(%s) of pakcage %s', deps, pkg.id);
  return deps;

  function findPackageDeps(depName, pkg) {
    // stop parsing dependencies when ignore
    if (~options.ignore.indexOf(depName)) {
      return [depName];
    }

    pkg = pkg.dependencies[depName];

    // throw when package doesn't exist
    if (!pkg) throw new PluginError('check', 'package ' + depName + ' not found');

    var entry = transportId(pkg.main, pkg, options);

    // hack: don't return css's dependencies
    if (/\.css$/.test(entry)) {
      return entry;
    }

    return Object.keys(pkg.dependencies)
      .map(function(key) {
        return findPackageDeps(key, pkg);
      })
      .concat(entry);
  }

  function checkPath(fullpath) {
    if (fs.existsSync(fullpath) || fs.existsSync(fullpath.replace(/\.js$/, ''))) return;
    throw new PluginError('check', 'file ' + fullpath + ' not found');
  }
}

/*
  Generate cmd id from vinyl object

  required options: pkg, idleading, rename
*/

function generateId(file, options) {
  var fInfo = getFileInfo(file, options.pkg);
  return transportId(fInfo.filepath, fInfo.pkg, options);
}

/*
  Generate cmd dependency from vinyl object

  required options: pkg, idleading, rename, ignore
*/

function generateDeps(file, options) {
  var fInfo = getFileInfo(file, options.pkg);
  return transportDeps(fInfo.filepath, fInfo.pkg, options)
    .map(function(item) {
      return '"' + item + '"';
    }).join(',');
}

/*
  Get filepath and pkg from vinyl object, attempt to find
  from dependent package if current package don't match.
*/

function getFileInfo(file, pkg) {
  // hack file.path for gulp-rev
  var filepath = relative(pkg.dest, file.revOrigPath || file.originPath || file.path);
  filepath = util.winPath(filepath);

  // if specified filepath is not in pkg.files, then find it in pkg.dependencies
  if (!pkg.files[filepath]) {
    var hasFound = false, pkgs = pkg.getPackages();
    for (var i in pkgs) {
      var p = pkgs[i];
      if (~file.path.indexOf(p.dest)) {
        filepath = relative(p.dest, file.path);
        filepath = util.winPath(filepath);
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

    this.push(file);
    return callback();
  });
}

function getStyleId (file, options) {
  var fileInfo = getFileInfo(file, options.pkg);
  var idleading = resolveIdleading(
    options.idleading,
    fileInfo.filepath,
    fileInfo.pkg
  );
  return template(idleading, fileInfo.pkg)
    .replace(/\\/g, '/')
    .replace(/\/$/, '')
    .replace(/\//g, '-')
    .replace(/\./g, '_');
}

function isFunction(fun) {
  return Object.prototype.toString.call(fun) === '[object Function]';
}

function resolveIdleading(idleading, filepath, pkg) {
  return isFunction(idleading) ?
    idleading(filepath, pkg) : idleading;
}
