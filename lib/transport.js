'use strict';

var extname = require('path').extname;
var extend = require('extend');
var through = require('through2');
var duplexer2 = require('duplexer2');
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

  function cssOrCss2js(file) {
    return extname(file.dependentPath) === '.css';
  }

  function switchCondition(file) {
    return extname(file.path);
  }

  var extMap = {
    '.css': gulpif(cssOrCss2js, css(opt), css2js(opt)),
    '.json': json(opt),
    '.tpl': tpl(opt),
    '.handlebars': handlebars(opt)
  };

  inputStream
  .pipe(include(opt))
  .pipe(gulpswitch(switchCondition, extMap))
  .pipe(js(opt))
  .pipe(concat(opt))
  .pipe(outputStream);

  return duplexer2(inputStream, outputStream);
};
