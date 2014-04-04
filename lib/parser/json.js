'use strict';

var util = require('../util');
var generateId = util.generateId;
var createStream = util.createStream;

module.exports = function jsonParser(options) {
  return createStream(options, 'json', parser);
};

var headerTpl = 'define("{{id}}", [], function(require, exports, module){\n';
var footerTpl = '\n});\n';

function parser(file, options) {
  var id = generateId(file, options);

  file.contents = Buffer.concat([
    new Buffer(util.template(headerTpl, {id: id, deps: ''})),
    new Buffer('module.exports ='),
    file.contents,
    new Buffer(footerTpl)
  ]);
  return file;
}
