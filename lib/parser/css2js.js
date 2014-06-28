'use strict';

var common = require('../common');
var css2str = require('css2str');
var createStream = common.createStream;
var getStyleId = common.getStyleId;

module.exports = function css2jsParser(options) {
  return createStream(options, 'css', parser);
};

function parser(file, options) {
  var code = 'require(\'import-style\')(\'' + css2js(file, options) + '\');\n';
  file.contents = new Buffer(code);
  file.originPath = file.path;
  file.path += '.js';
  return file;
}

function css2js(file, options) {
  var opt;
  if (options.styleBox === true) {
    var styleId = getStyleId(file, options);
    opt = {prefix: ['.', styleId, ' '].join('')};
  }

  return css2str(file.contents, opt);
}
