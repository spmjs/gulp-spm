'use strict';

var extname = require('path').extname;
var requires = require('searequire');
var util = require('../util');
var rename = util.rename;
var template = util.template;
var common = require('../common');
var generateId = common.generateId;
var generateDeps = common.generateDeps;
var createStream = common.createStream;
var transportId = common.transportId;
var getFileInfo = common.getFileInfo;
var getStyleId = common.getStyleId;

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

  //replace filename with suffix
  file.originPath = file.path;
  file.path = rename(file.path, options);

  return file;
}

function wrap(file, options) {
  var id = generateId(file, options);
  var deps = generateDeps(file, options);

  return Buffer.concat([
    new Buffer(util.template(headerTpl, {id: id, deps: deps})),
    file.contents,
    getStyleBox(file, options),
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
    file = findFile(file, pkg.files);
    return transportId(file, pkg, options);
  }

  var deps = pkg.dependencies, pkg_ = deps[id];
  if (deps[id] && options.ignore.indexOf(id) === -1) {
    id = transportId(pkg_.main, pkg_, options);
  }

  return id;
}

function getStyleBox(file, options) {
  var styleId = getStyleId(file, options);
  var code = options.styleBox === true && styleId ?
    'module.exports.outerBoxClass="' + styleId + '";\n' : '';
  return new Buffer(code);
}

/*
  find file from follow order
  -> path
  -> path.js
  -> path/index.js
*/

function findFile(file, files) {
  var arr = [file];
  if (extname(file) !== '.js') {
    arr.push(file + '.js');
  }
  if (!extname(file)) {
    arr.push(file + '/index.js');
  }

  for (var i in arr) {
    if (files[arr[i]]) {
      return arr[i];
    }
  }
  return file;
}
