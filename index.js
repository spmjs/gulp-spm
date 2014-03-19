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
