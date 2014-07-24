'use strict';

var createStream = require('../common').createStream;
var debug = require('debug')('transport:tpl');

module.exports = function tplParser(options) {
  return createStream(options, 'tpl', parser);
};

function parser(file) {
  debug('filepath:%s', file.path);
  var code = file
  .contents
  .toString()
  .replace(/\n|\r/g, '')
  .replace(/'/g, '\'');

  code = 'module.exports = \'' + code + '\';\n';
  file.contents = new Buffer(code);
  file.originPath = file.originPath || file.path;
  file.path += '.js';
  return file;
}
