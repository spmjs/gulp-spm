'use strict';

var transport = require('./lib/parser/js');
transport.tplParser = require('./lib/parser/tpl');
transport.jsonParser = require('./lib/parser/json');
transport.css2jsParser = require('./lib/parser/css2js');
transport.handlebarsParser = require('./lib/parser/handlebars');
transport.cssParser = require('./lib/parser/css');
transport.util = require('./lib/util');

module.exports = transport;
