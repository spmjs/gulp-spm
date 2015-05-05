'use strict';

var path = require('path');
var join = path.join;
var extname = path.extname;
var dirname = path.dirname;
var debug = require('debug')('transport:util');
var util = require('util');

/*
  exports
*/

exports.template = template;
exports.extendOption = extendOption;
exports.hideExt = hideExt;
exports.addExt = addExt;
exports.isRelative = isRelative;
exports.isLocal = isLocal;
exports.resolvePath = resolvePath;
exports.winPath = winPath;
exports.throwError = throwError;
exports.getRenameOpts = getRenameOpts;

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
  Test filepath is relative path or not
*/

function isRelative(filepath) {
  return filepath.charAt(0) === '.';
}


/*
  Test filepath is local path or not
*/

function isLocal(filepath) {
  return !/^https?:\/\//.test(filepath) && !/^data:/.test(filepath);
}


/*
  resolve a `relative` path base on `base` path
*/

function resolvePath(relative, base) {
  if (!isRelative(relative) || !base) return relative;
  debug('transport relative id(%s) of basepath(%s)', relative, base);
  relative = join(dirname(base), relative);
  if (isRelative(relative)) {
    throwError('%s is out of bound of %s', winPath(relative), base);
  }
  return relative;
}

function winPath(path) {
  return path.replace(/\\/g, '/');
}


function throwError() {
  var message = util.format.apply(null, [].slice.call(arguments));
  throw new Error(message);
}

function getRenameOpts(file, opts) {
  if (typeof opts === 'function') {
    return opts.bind(null, file);
  }

  opts = opts || {};
  var ret = {suffix: ''};
  if (opts.hash) {
    ret.suffix += '-' + file.hash;
  }
  if (opts.debug) {
    ret.suffix += '-debug';
  }
  return ret;
}
