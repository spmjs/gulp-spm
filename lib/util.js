'use strict';

var path = require('path');
var join = path.join;
var extname = path.extname;
var dirname = path.dirname;
var PluginError = require('gulp-util').PluginError;
var debug = require('debug')('transport:util');
var renameFile = require('rename');

/*
  exports
*/

exports.template = template;
exports.extendOption = extendOption;
exports.hideExt = hideExt;
exports.addExt = addExt;
exports.rename = rename;
exports.isRelative = isRelative;
exports.resolvePath = resolvePath;
exports.winPath = winPath;

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
  Set options
*/

function extendOption(options) {
  var opt = {
    // pkg info parsed by father
    pkg : null,

    // omit the given dependencies when transport
    ignore: [],

    // id prefix template that can use pkg as it's data
    idleading: '{{name}}/{{version}}',

    rename: null,

    include: 'relative'
  };

  if (!options) return opt;

  for (var key in options) {
    var val = options[key];
    if (val !== undefined && val !== null) {
      opt[key] = val;
    }
  }

  return opt;
}


/*
  Hide .js if exists
*/

function hideExt(filepath) {
  return extname(filepath) === '.js' ? filepath.replace(/\.js$/, '') : filepath;
}


/*
  add .js if not exists
*/

function addExt(filepath) {
  return extname(filepath) ? filepath : (filepath + '.js');
}


/*
  Rename file, more info see https://github.com/popomore/rename

  E.g. rename('a.js', {rename: {suffix: '-debug'}}) -> a-debug.js
*/

function rename(filepath, options) {
  if (options && options.rename) {
    try {
      filepath = renameFile(filepath, options.rename);
    } catch(e) {
      throw new PluginError('rename', filepath + ' ' + e.message);
    }
  }
  return filepath;
}


/*
  Test filepath is relative path or not
*/

function isRelative(filepath) {
  return filepath.charAt(0) === '.';
}


/*
  resolve a `relative` path base on `base` path
*/

function resolvePath(relative, base) {
  if (!isRelative(relative) || !base) return relative;
  debug('transport relative id(%s) of basepath(%s)', relative, base);
  relative = join(dirname(base), relative);
  if (isRelative(relative)) throw new PluginError('resolvePath', winPath(relative) + ' is out of bound');
  return relative;
}

function winPath(path) {
  return path.replace(/\\/g, '/');
}
