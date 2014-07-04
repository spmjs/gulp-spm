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

  inputStream
  .pipe(gulpif(isCss, streams.css, jsStream))
  .pipe(outputStream);

  return duplexer2(inputStream, outputStream);
};

function getStream(opt) {
  var defaultStream = {
    '.css': css(opt),
    '.css.js': pipe(
      css(opt),
      css2js(opt)
    ),
    '.json': json(opt),
    '.tpl': tpl(opt),
    '.js': js(opt),
    '.handlebars': handlebars(opt)
  };

  var map = extend({}, defaultStream, opt.stream);
  var jsStream = map['.js'];
  var cssStream = map['.css'];
  delete map['.js'];
  delete map['.css'];
  return {
    js: jsStream,
    css: cssStream,
    other: map
  };
}

function isCss(file) {
  return extname(file.path) === '.css';
}

function switchCondition(file) {
  var ext = extname(file.path);
  return ext === '.css' ? '.css.js' : ext;
}
