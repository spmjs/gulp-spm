'use strict';

var util = require('../util');
var getId = util.getId;
var createStream = util.createStream;

module.exports = function tplParser(options) {
  return createStream(options, 'tpl', parser);
};

var headerTpl = 'define("{{id}}", [], function(require, exports, module){\n';
var footerTpl = '\n});\n';

function parser(file, options) {
  var id = getId(file, options);
  var code = file.contents.toString();

  file.contents = Buffer.concat([
    new Buffer(util.template(headerTpl, {id: id, deps: ''})),
    new Buffer('module.exports="'),
    new Buffer(code.replace(/\n|\r/g, '')),
    new Buffer('";'),
    new Buffer(footerTpl)
  ]);
  return file;
}
