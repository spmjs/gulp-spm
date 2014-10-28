'use strict';

var createStream = require('../common').createStream;

exports.tpl = function tplParser(options) {
  var debug = require('debug')('transport:tpl');
  return createStream(options, 'tpl', function(file) {
    debug('filepath:%s', file.path);
    return parse(file);
  });
};

exports.html = function tplParser(options) {
  var debug = require('debug')('transport:html');
  return createStream(options, 'html', function(file) {
    debug('filepath:%s', file.path);
    return parse(file);
  });
};

function parse(file) {
  var code = file
  .contents
  .toString()
  .replace(/\n|\r/g, '')
  .replace(/'/g, '\\\'');

  code = 'module.exports = \'' + code + '\';\n';
  file.contents = new Buffer(code);
  file.originPath = file.originPath || file.path;
  file.path += '.js';
  return file;
}
