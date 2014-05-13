'use strict';

var util = require('../util');
var common = require('../common');
var generateId = common.generateId;
var createStream = common.createStream;

module.exports = function css2jsParser(options) {
  return createStream(options, 'css', parser);
};

var headerTpl = 'define("{{id}}", [], function(require, exports, module){\n';
var footerTpl = '\n});\n';

function parser(file, options) {
  var id = generateId(file, options);
  var code = file.contents.toString();

  file.contents = Buffer.concat([
    new Buffer(util.template(headerTpl, {id: id, deps: ''})),
    new Buffer('seajs.importStyle("'),
    new Buffer(code.replace(/\n|\r/g, '')),
    new Buffer('");'),
    new Buffer(footerTpl)
  ]);
  return file;
}
