'use strict';

var createStream = require('../common').createStream;
var debug = require('debug')('transport:json');

module.exports = function jsonParser(options) {
  return createStream(options, 'json', parser);
};

function parser(gfile) {
  debug('filepath:%s', gfile.path);
  var code = 'module.exports = ' + clean(gfile) + ';\n';
  gfile.contents = new Buffer(code);
  gfile.path += '.js';
  return gfile;
}

function clean(gfile) {
  var code = gfile.contents.toString();
  return JSON.stringify(JSON.parse(code));
}
