'use strict';

var extname = require('path').extname;
var join = require('path').join;
var extend = require('extend');
var mixarg = require('mixarg');
var through = require('through2');
var duplexer2 = require('duplexer2');
var pipe = require('multipipe');
var gulpswitch = require('stream-switch');
var gulpif = require('gulp-if');
var is = require('is-type');
var Package = require('father').SpmPackage;
var plugin = require('./plugin');
var include = plugin.include;
var concat = plugin.concat;
var js = plugin.js;
var css = plugin.css;
var css2js = plugin.css2js;
var json = plugin.json;
var tpl = plugin.tpl;
var html = plugin.html;
var handlebars = plugin.handlebars;

var defaults = {
  // for parse
  cwd: process.cwd(),
  moduleDir: 'spm_modules',
  skip: '',
  ignore: '',

  // for transport
  include: 'relative',
  idleading: '{{name}}/{{version}}',
  rename: '',
  stream: null
};

module.exports = function(opt) {
  var cwd = opt.cwd || defaults.cwd;
  var pkg = require(join(cwd, 'package.json'));
  var spm = pkg.spm || {};

  opt = mixarg(defaults, spm.buildArgs || '', opt);
  if (is.string(opt.ignore)) opt.ignore = opt.ignore ? opt.ignore.split(/\s*,\s*/) : [];
  if (is.string(opt.skip)) opt.skip = opt.skip ? opt.skip.split(/\s*,\s*/) : [];
  opt.pkg = new Package(opt.cwd, {
    skip: opt.skip,
    ignore: opt.ignore,
    moduleDir: opt.moduleDir
  });

  var inputStream = through.obj();
  var outputStream = through.obj();

  var streams = getStream(opt);

  var jsStream = pipe(
    include(opt),
    gulpswitch(switchCondition, streams.other),
    streams.js,
    concat(opt)
  );
  var cssStream = streams.css;

  inputStream
  .pipe(gulpif(isCss, cssStream, jsStream))
  .pipe(outputStream);

  errorHandle(jsStream);
  errorHandle(cssStream);

  return duplexer2(inputStream, outputStream);

  function errorHandle(stream) {
    stream.on('error', function(e) {
      outputStream.emit('error', e);
    });
  }
};

function getStream(opt) {
  var defaultStream = {
    '.css': css(opt),
    '.css.js': pipe(
      // overide rename for this
      css(extend({}, opt, {rename: rename})),
      css2js(opt)
    ),
    '.json': json(opt),
    '.tpl': tpl(opt),
    '.html': html(opt),
    '.js': js(opt),
    '.handlebars': handlebars(opt)
  };

  var stream = opt.stream || {}, ret = {other: {}};
  Object.keys(defaultStream).forEach(function(key) {
    var func = stream[key];
    if (func && typeof func !== 'function') {
      throw new Error('opt.stream\'s value should be function');
    }
    var val = (typeof func === 'function' && func(opt)) || defaultStream[key];
    if (key === '.css' || key === '.js') {
      ret[key.substring(1)] = val;
    } else {
      ret.other[key] = val;
    }
  });

  return ret;

  function rename(file) {
    return file;
  }
}

function isCss(file) {
  return extname(file.path) === '.css';
}

function switchCondition(file) {
  var ext = extname(file.path);
  return ext === '.css' ? '.css.js' : ext;
}
