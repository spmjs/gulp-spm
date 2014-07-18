'use strict';

var extname = require('path').extname;
var extend = require('extend');
var through = require('through2');
var duplexer2 = require('duplexer2');
var pipe = require('multipipe');
var gulpswitch = require('stream-switch');
var gulpif = require('gulp-if');
var include = require('./plugin/include');
var concat = require('./plugin/concat');
var dest = require('./plugin/dest');
var js = require('./plugin/js');
var css = require('./plugin/css');
var css2js = require('./plugin/css2js');
var json = require('./plugin/json');
var tpl = require('./plugin/tpl');
var handlebars = require('./plugin/handlebars');

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
  var destStream = dest(opt);

  inputStream
  .pipe(gulpif(isCss, cssStream, jsStream))
  .pipe(destStream)
  .pipe(outputStream);

  errorHandle(jsStream);
  errorHandle(destStream);
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
