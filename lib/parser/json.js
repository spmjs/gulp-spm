'use strict';

var createStream = require('../common').createStream;
var debug = require('debug')('transport:json');

module.exports = function jsonParser(options) {
  return createStream(options, 'json', parser);
};

function parser(file) {
  debug('filepath:%s', file.path);
  var code = 'module.exports = ' + file.contents.toString().replace(/;?\n?$/, '') + ';\n';
  file.contents = new Buffer(code);
  file.originPath = file.path;
  file.path += '.js';
  return file;
}
