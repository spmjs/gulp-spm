'use strict';

var util = require('../util');
var generateId = util.generateId;
var generateDeps = util.generateDeps;
var createStream = util.createStream;
var template = util.template;
var transportId = util.transportId;
var getFileInfo = util.getFileInfo;

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
  var reg = /require\(["']([a-zA-Z0-9-\.\/_]*)["']\)/g;
  code = code.replace(reg, function(all, match) {
    var id = replaceId(match, fInfo.pkg, options, fInfo.filepath);
    return template('require("{{id}}")', {id: id});
  });
  return new Buffer(code);
}

function replaceId(id, pkg, options, base) {
  id = util.hideExt(id);

  if (util.isRelative(id)) {
    return transportId(id, pkg, options, base);
  }

  var deps = pkg.dependencies, pkg_ = deps[id];
  if (deps[id] && options.ignore.indexOf(id) === -1) {
    id = transportId(pkg_.main, pkg_, options);
  }

  return id;
}
