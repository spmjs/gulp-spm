'use strict';

var createStream = require('../common').createStream;

module.exports = function jsonParser(options) {
  return createStream(options, 'json', parser);
};

function parser(file) {
  var code = 'module.exports = ' + file.contents;
  file.contents = new Buffer(code);
  return file;
}
