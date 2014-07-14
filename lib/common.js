'use strict';

var path = require('path');
var join = path.join;
var extname = path.extname;
var relative = path.relative;
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
exports.getExtra = getExtra;
exports.getDepsPackage = getDepsPackage;

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
  var include = options.include;
  var ignore = getDepsPackage(options.ignore, pkg);

  if (!pkg.files[filepath]) {
    throw new PluginError('transportDeps', filepath + ' is not included in ' + Object.keys(pkg.files));
  }

  var deps, file = pkg.files[filepath];

  if (include === 'all') {
    deps = getDepsWithAll(file, ignore);
    debug('transport deps(%s) of pakcage %s, include: %s', deps, pkg.id, include);
    return deps;
  }

  var extra = getExtra(file, pkg, options);

  deps = file.lookup(function(fileInfo) {
    var file = fileInfo.filepath;
    var pkg = fileInfo.pkg;
    var isRelative = fileInfo.isRelative;

    // needn't contain css
    if (fileInfo.extension === 'css') {
      return false;
    }

    // relative file need transport only when self
    if (isSelf(pkg) && include !== 'self') {
      return false;
    }

    // package dependencies
    if (!isSelf(pkg)) {
      // ignore relative file in package of dependencies
      if (isRelative) return false;

      // don't transport ignore package
      if (~ignore.indexOf(pkg.name)) {
        return pkg.name;
      }
    }

    return transportId(file, pkg, options);
  }, extra);

  deps = deps.filter(function(item, index, arr) {
    return index === arr.indexOf(item);
  });

  debug('transport deps(%s) of pakcage %s, include: %s', deps, pkg.id, include);
  return deps;

  // test if pkg is self
  function isSelf(pkg_) {
    return pkg_.name === pkg.name;
  }

  function getDepsWithAll(file, ignore) {
    return file.lookup(function(fileInfo) {
      var name = fileInfo.pkg.name;
      return !fileInfo.isRelative && ignore.indexOf(name) > -1 ?
        name : false;
    });
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
  var fullpath = file.revOrigPath || file.originPath || file.path;
  var filepath = relative(pkg.dest, fullpath);
  filepath = util.winPath(filepath);

  // if specified filepath is not in pkg.files, then find it in pkg.dependencies
  if (!pkg.files[filepath]) {
    var hasFound = false, pkgs = pkg.getPackages();
    for (var i in pkgs) {
      var p = pkgs[i];
      if (~fullpath.indexOf(p.dest)) {
        filepath = relative(p.dest, fullpath);
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
      return callback(new PluginError(pluginName, e));
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

/*
  Get extra fileInfo for file.lookup
  see https://github.com/popomore/father#file-object
*/

var extDeps = {
  'handlebars': 'handlebars-runtime',
  'css': 'import-style'
};

function getExtra(file, pkg, options) {
  return Object.keys(extDeps).filter(function(ext) {
    return file.extension === ext || file.hasExt(ext, ignoreCssOutDependency);
  }).map(function(ext) {
    var name = extDeps[ext];
    var pkg_ = options.pkg.dependencies[name];
    if (!pkg_) {
      throw new Error(name + ' not exist, but required .' + ext);
    }
    return {
      filepath: pkg_.main,
      pkg: pkg_,
      isRelative: false,
      extension: extname(pkg_.main).substring(1)
    };
  });

  // return false if css file is not in pkg or pkg.dependencies
  function ignoreCssOutDependency(fileInfo) {
    var pkg = fileInfo.pkg;
    return !(fileInfo.extension === 'css' && !(isSelf(pkg) || isInDeps(pkg)));
  }

  // test if it is in pkg.dependencies
  function isInDeps(pkg_) {
    return !!pkg.dependencies[pkg_.name];
  }

  // test if pkg is self
  function isSelf(pkg_) {
    return pkg_.name === pkg.name;
  }
}

function getDepsPackage(name, pkg) {
  if (!Array.isArray(name)) name = [name];
  var pkgs = pkg.getPackages();

  var deps = [];
  Object.keys(pkgs).filter(function(key) {
    // get packages which match name
    return name.indexOf(key.split('@')[0]) > -1;
  }).map(function(key) {
    var pkg = pkgs[key];
    deps = deps.concat(_getDepsPackage(pkg));
  });

  return deps.filter(function(item, index, arr) {
    return index === arr.indexOf(item);
  });

  function _getDepsPackage(pkg) {
    var deps = [pkg.name];
    Object.keys(pkg.dependencies)
    .forEach(function(name) {
      deps = deps.concat(_getDepsPackage(pkg.dependencies[name]));
    });
    return deps;
  }
}
