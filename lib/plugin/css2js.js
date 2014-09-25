'use strict';

var common = require('../common');
var css2str = require('css2str');
var createStream = common.createStream;
var getStyleId = common.getStyleId;
var getFile = common.getFile;
var debug = require('debug')('transport:css2js');

module.exports = function css2jsParser(options) {
  return createStream(options, 'css', parser);
};

function parser(gfile, options) {
  debug('filepath:%s', gfile.path);
  var code = 'require(\'import-style\')(\'' + css2js(gfile, options) + '\');\n';
  gfile.contents = new Buffer(code);
  gfile.path += '.js';
  return gfile;
}

function css2js(gfile, options) {
  var opt;
  if (options.styleBox === true) {
    var file = getFile(gfile, options.pkg);
    var styleId = getStyleId(file, options);
    opt = {prefix: ['.', styleId, ' '].join('')};
  }
  return css2str(gfile.contents, opt);
}
