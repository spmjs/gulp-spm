'use strict';

var path = require('path');
var join = path.join;
var extname = path.extname;
var relative = path.relative;
var _ = require('lodash');
var through = require('through2');
var PluginError = require('gulp-util').PluginError;
var debug = require('debug')('transport:util');

/*
  exports
*/

exports.transportId = transportId;
exports.transportDeps = transportDeps;
exports.template = template;
exports.extendOption = extendOption;
exports.createStream = createStream;
exports.generateId = generateId;
exports.generateDeps = generateDeps;
exports.isRelative = isRelative;
exports.hideExt = hideExt;

/*
  Transport cmd id

  Options
    idleading: id prefix template that can use pkg as it's data
*/

function transportId(filepath, pkg, options) {
  var prefix = template(options.idleading, pkg);
  var id = join(prefix, hideExt(filepath));
  debug('transport id(%s) of pakcage %s', id, pkg.id);
  return id;
}

/*
  Transport cmd dependencies, it will get deep dependencies of the file,
  but will ignore relative module of the dependent package.

  Options
    format: a directory template that can use pkg as it's data
    ignore: omit the given dependencies
*/

function transportDeps(filepath, pkg, options) {
  if (!pkg.files[filepath]) {
    throw new PluginError('transportDeps', filepath + ' is not included in ' + Object.keys(pkg.files));
  }

  var fileDeps = pkg.files[filepath].dependencies;

  var deps = _(fileDeps)
    .map(function(file) {
      if (isRelative(file)) {
        return file;
      } else {
        var pkg_ = pkg.dependencies[file];
        if (!pkg_) {
          // not transport when no package
          debug('package %s not found', file);
          return file;
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

    return transportDeps(pkg.main, pkg, options)
      .filter(function(item) {
        // don't contain relative file
        return item.charAt(0) !== '.';
      })
      .concat(entry);
  }
}

/*
  Simple template like

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
  if (!options || !options.pkg) {
    throw new PluginError('transport', 'pkg missing');
  }
  options.ignore = options.ignore || [];
  options.idleading = options.idleading || '{{name}}/{{version}}';
  return options;
}

function createStream(options, type, parser) {
  options = extendOption(options);
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

/*
  Generate cmd id from vinyl object
*/

function generateId(file, options) {
  var ret = getFile(file, options.pkg);
  return transportId(ret[0], ret[1], options);
}

/*
  Generate cmd dependency from vinyl object
*/

function generateDeps(file, options) {
  var ret = getFile(file, options.pkg);
  return transportDeps(ret[0], ret[1], options)
    .map(function(item) {
      return '"' + item + '"';
    }).join(',');
}

/*
  Hide .js if exists
*/

function hideExt(filepath) {
  return extname(filepath) === '.js' ? filepath.replace(/\.js$/, '') : filepath;
}

function isRelative(filepath) {
  return filepath.charAt(0) === '.';
}

function getFile(file, pkg) {
  // hack file.path for gulp-rev
  var filepath = relative(pkg.dest, file.revOrigPath || file.path);

  // if specified file is not in pkg.files, then find it in pkg.dependencies
  if (!pkg.files[filepath]) {
    var deps = pkg.dependencies;
    for (var i in deps) {
      var p = deps[i];
      if (~file.base.indexOf(p.dest)) {
        filepath = relative(p.dest, file.path);
        pkg = p;
        break;
      }
    }
  }
  return [filepath, pkg];
}
