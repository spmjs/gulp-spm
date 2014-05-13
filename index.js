'use strict';

var transport = require('./lib/parser/js');

// parser
transport.parser = {
  tplParser: require('./lib/parser/tpl'),
  jsonParser: require('./lib/parser/json'),
  css2jsParser: require('./lib/parser/css2js'),
  handlebarsParser: require('./lib/parser/handlebars'),
  cssParser: require('./lib/parser/css')
};

// common method
var common = require('./lib/common');
for (var name in common) {
  transport[name] = common[name];
}

// util
transport.util = require('./lib/util');

module.exports = transport;
