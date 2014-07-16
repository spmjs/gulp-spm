'use strict';

var extname = require('path').extname;
var requires = require('searequire');
var util = require('../util');
var rename = util.rename;
var template = util.template;
var isRelative = util.isRelative;
var hideExt = util.hideExt;
var resolvePath = util.resolvePath;
var winPath = util.winPath;
var common = require('../common');
var createStream = common.createStream;
var transportDeps = common.transportDeps;
var transportId = common.transportId;
var getFileInfo = common.getFileInfo;
var getStyleId = common.getStyleId;
var debug = require('debug')('transport:js');

module.exports = jsParser;

function jsParser(options) {
  return createStream(options, 'js', parser);
}

var headerTpl = 'define("{{id}}", [{{deps}}], function(require, exports, module){\n';
var footerTpl = '\n});\n';

function parser(file, options) {
  debug('filepath:%s', file.path);

  file.contents = new Buffer(transport(file, options));

  //replace filename with suffix
  file.originPath = file.originPath || file.path;
  file.path = rename(file.path, options);

  return file;
}

function transport(file, options) {
  var code = file.contents.toString();
  var fInfo = getFileInfo(file, options.pkg);
  var id = transportId(fInfo.filepath, fInfo.pkg, options);
  var deps = transportDeps(fInfo.filepath, fInfo.pkg, options);

  return template(headerTpl, {id: id, deps: arr2str(deps)}) +
    replace(code, fInfo, options) +
    getStyleBox(file, options) +
    footerTpl;
}

function replace(code, fInfo, options) {
  return requires(code, function(require) {
    var id = replaceId(require.path, fInfo.pkg, options, fInfo.filepath);
    return template('require("{{id}}")', {id: id});
  });
}

function replaceId(id, pkg, options, base) {
  if (isRelative(id)) {
    id = hideExt(id);
    var file = winPath(resolvePath(id, base));
    file = findFile(file, pkg.files);
    return transportId(file, pkg, options);
  }

  if (id === 'import-style') pkg = options.pkg;
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

function arr2str(arr) {
  return arr.map(function(item) {
    return '"' + item + '"';
  }).join(',');
}
