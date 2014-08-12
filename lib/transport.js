'use strict';

var extname = require('path').extname;
var extend = require('extend');
var through = require('through2');
var duplexer2 = require('duplexer2');
var pipe = require('multipipe');
var gulpswitch = require('stream-switch');
var gulpif = require('gulp-if');
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
  ignore: '',
  include: ''
};

module.exports = function(opt) {
  opt = extend({}, defaults, opt);

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
