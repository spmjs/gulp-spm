'use strict';

var createStream = require('../common').createStream;

exports.tpl = function tplParser(options) {
  var debug = require('debug')('transport:tpl');
  return createStream(options, 'tpl', function(gfile) {
    debug('filepath:%s', gfile.path);
    return parse(gfile);
  });
};

exports.html = function tplParser(options) {
  var debug = require('debug')('transport:html');
  return createStream(options, 'html', function(gfile) {
    debug('filepath:%s', gfile.path);
    return parse(gfile);
  });
};

function parse(gfile) {
  var code = gfile
  .contents
  .toString()
  .replace(/\n|\r/g, '')
  .replace(/'/g, '\'');

  code = 'module.exports = \'' + code + '\';\n';
  gfile.contents = new Buffer(code);
  gfile.path += '.js';
  return gfile;
}
