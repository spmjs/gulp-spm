'use strict';

var util = require('./util');
var generateId = util.generateId;
var generateDeps = util.generateDeps;
var createStream = util.createStream;

module.exports = function tplParser(options) {
  return createStream(options, 'js', parser);
};

var headerTpl = 'define("{{id}}", [{{deps}}], function(require, exports, module){\n';
var footerTpl = '\n});\n';

function parser(file, options) {
  var id = generateId(file, options);
  var deps = generateDeps(file, options);

  file.contents = Buffer.concat([
    new Buffer(util.template(headerTpl, {id: id, deps: deps})),
    file.contents,
    new Buffer(footerTpl)
  ]);
  return file;
}
