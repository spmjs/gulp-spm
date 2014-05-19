'use strict';

var requires = require('requires');
var util = require('../util');
var template = util.template;
var common = require('../common');
var generateId = common.generateId;
var generateDeps = common.generateDeps;
var createStream = common.createStream;
var transportId = common.transportId;
var getFileInfo = common.getFileInfo;

module.exports = transport;
transport.wrap = wrap;
transport.replace = replace;

function transport(options) {
  return createStream(options, 'js', parser);
}

var headerTpl = 'define("{{id}}", [{{deps}}], function(require, exports, module){\n';
var footerTpl = '\n});\n';

function parser(file, options) {
  file.contents = replace(file, options);
  file.contents = wrap(file, options);
  return file;
}

function wrap(file, options) {
  var id = generateId(file, options);
  var deps = generateDeps(file, options);

  return Buffer.concat([
    new Buffer(util.template(headerTpl, {id: id, deps: deps})),
    file.contents,
    new Buffer(footerTpl)
  ]);
}

function replace(file, options) {
  var fInfo = getFileInfo(file, options.pkg);
  var code = file.contents.toString();
  code = requires(code, function(require) {
    var id = replaceId(require.path, fInfo.pkg, options, fInfo.filepath);
    return template('require("{{id}}")', {id: id});
  });
  return new Buffer(code);
}

function replaceId(id, pkg, options, base) {
  id = util.hideExt(id);

  if (util.isRelative(id)) {
    var file = util.resolvePath(id, base);
    return transportId(file, pkg, options);
  }

  var deps = pkg.dependencies, pkg_ = deps[id];
  if (deps[id] && options.ignore.indexOf(id) === -1) {
    id = transportId(pkg_.main, pkg_, options);
  }

  return id;
}
