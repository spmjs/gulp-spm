'use strict';

var transport = require('./lib/transport');

// parser
transport.plugin = {
  tplParser: require('./lib/parser/tpl'),
  jsonParser: require('./lib/parser/json'),
  css2jsParser: require('./lib/parser/css2js'),
  handlebarsParser: require('./lib/parser/handlebars'),
  cssParser: require('./lib/parser/css'),
  jsParser: require('./lib/parser/js')
};

// common method
var common = require('./lib/common');
for (var name in common) {
  transport[name] = common[name];
}

// util
transport.util = require('./lib/util');

module.exports = transport;
