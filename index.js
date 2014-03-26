'use strict';

var lazypipe = require('lazypipe');
var wrap = require('./lib/cmdwrap');
var replace = require('./lib/cmdreplace');

module.exports = function transport(options) {
  return lazypipe()
    .pipe(replace, options)
    .pipe(wrap, options)();
};

module.exports.util = require('./lib/util');
module.exports.cmdwrap = wrap;
module.exports.cmdreplace = replace;
module.exports.tplParser = require('./lib/parser/tpl');
module.exports.jsonParser = require('./lib/parser/json');
module.exports.css2jsParser = require('./lib/parser/css2js');
module.exports.handlebarsParser = require('./lib/parser/handlebars');
