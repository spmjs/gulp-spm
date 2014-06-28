'use strict';

var createStream = require('../common').createStream;

module.exports = function tplParser(options) {
  return createStream(options, 'tpl', parser);
};

function parser(file) {
  var code = file
  .contents
  .toString()
  .replace(/\n|\r/g, '')
  .replace(/'/g, '\'');

  code = 'module.exports=\'' + code + '\';\n';
  file.contents = new Buffer(code);
  file.originPath = file.path;
  file.path += '.js';
  return file;
}
