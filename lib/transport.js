'use strict';

var extname = require('path').extname;
var extend = require('extend');
var through = require('through2');
var duplexer2 = require('duplexer2');
var pipe = require('multipipe');
var gulpswitch = require('stream-switch');
var gulpif = require('gulp-if');
var include = require('./parser/include');
var concat = require('./parser/concat');
var js = require('./parser/js');
var css = require('./parser/css');
var css2js = require('./parser/css2js');
var json = require('./parser/json');
var tpl = require('./parser/tpl');
var handlebars = require('./parser/handlebars');

var defaults = {
  ignore: '',
  include: ''
};

module.exports = function(opt) {
  opt = extend({}, defaults, opt);

  var inputStream = through.obj();
  var outputStream = through.obj();

  var extMap = {
    '.css': css(opt),
    '.css.js': css2js(opt),
    '.json': json(opt),
    '.tpl': tpl(opt),
    '.handlebars': handlebars(opt)
  };

  var extCss = extMap['.css'];
  delete extMap['.css'];

  var jsStream = pipe(
    include(opt),
    gulpswitch(switchCondition, extMap),
    js(opt),
    concat(opt)
  );

  inputStream
  .pipe(gulpif(isCss, extCss, jsStream))
  .pipe(outputStream);

  return duplexer2(inputStream, outputStream);
};

function isCss(file) {
  return extname(file.path) === '.css';
}

function switchCondition(file) {
  var ext = extname(file.path);
  return ext === '.css' ? '.css.js' : ext;
}
