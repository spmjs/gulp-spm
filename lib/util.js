'use strict';

var path = require('path');
var join = path.join;
var extname = path.extname;
var _ = require('lodash');
var through = require('through2');
var PluginError = require('gulp-util').PluginError;

/*
  Transport cmd id

  Options
    idleading: id prefix template that can use pkg as it's data
*/

exports.transportId = function transportId(filepath, pkg, options) {
  var prefix = exports.template(options.idleading, pkg);

  if (extname(filepath) === '.js') {
    filepath = filepath.replace('.js', '');
  }

  return join(prefix, filepath);
};

/*
  Transport cmd dependencies, it will get deep dependencies of the file,
  but will ignore relative module of the dependent package.

  Options
    format: a directory template that can use pkg as it's data
    ignore: omit the given dependencies
*/

exports.transportDeps = function transportDeps(filepath, pkg, options) {
  var fileDeps = pkg.files[filepath].dependencies;

  return _(fileDeps)
    .map(function(file) {
      if (file.charAt(0) === '.') {
        return file;
      } else {
        var p = pkg.dependencies[file];
        if (!p) {
          console.error('not find ' + file + ' in [' + Object.keys(pkg.dependencies) + ']');
          return file;
        }
        return findDeps(p);
      }
    })
    .flatten()
    .uniq()
    .value();

  function findDeps(pkg) {
    var entry;
    if (options.ignore.indexOf(pkg.name) > -1) {
      entry = pkg.name;
    } else {
      entry = exports.transportId(pkg.main, pkg, options);
    }

    // hack: don't return css's dependencies
    return /\.css$/.test(entry) ? entry :
      transportDeps(pkg.main, pkg, options).concat(entry);
  }
};

/*
  Simple template like

  ```
  var tpl = '{{name}}/{{version}}';
  util.template(tpl, {name:'base', version: '1.0.0'});
  ```
*/

exports.template = function template(format, data) {
  if (!format) return '';
  return format.replace(/{{([a-z]*)}}/g, function(all, match) {
    return data[match] || '';
  });
};

/*
  Set option defaults
*/

exports.extendOption = function extendOption(options) {
  if (!options || !options.pkg) {
    throw new Error('pkg missing');
  }
  options.ignore = options.ignore || [];
  options.idleading = options.idleading || '{{name}}/{{version}}';
  return options;
};

exports.createStream = function createStream(options, type, parser) {
  options = exports.extendOption(options);
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
};

exports.getId = function getId(file, options) {
  var ret = getFile(file, options.pkg);
  return exports.transportId(ret[0], ret[1], options);
};

exports.getDeps = function getDeps(file, options) {
  var ret = getFile(file, options.pkg);
  return exports.transportDeps(ret[0], ret[1], options)
    .map(function(item) {
      return '"' + item + '"';
    }).join(',');
};

function getFile(file, pkg) {
  // hack file.path for gulp-rev
  var filepath = path.relative(pkg.dest, file.revOrigPath || file.path);

  // if specified file is not in pkg.files, then find it in pkg.dependencies
  if (!pkg.files[filepath]) {
    var deps = pkg.dependencies;
    for (var i in deps) {
      var p = deps[i];
      if (~file.base.indexOf(p.dest)) {
        filepath = p.main;
        pkg = p;
        break;
      }
    }
  }
  return [filepath, pkg];
}
