'use strict';

var lazypipe = require('lazypipe');
var wrap = require('./lib/cmdwrap');
var replace = require('./lib/cmdreplace');

module.exports = transport;

transport.util = require('./lib/util');
transport.cmdwrap = wrap;
transport.cmdreplace = replace;
transport.tplParser = require('./lib/parser/tpl');
transport.jsonParser = require('./lib/parser/json');
transport.css2jsParser = require('./lib/parser/css2js');
transport.handlebarsParser = require('./lib/parser/handlebars');
transport.cssParser = require('./lib/parser/css');

function transport(options) {
  return lazypipe()
    .pipe(replace, options)
    .pipe(wrap, options)();
}
