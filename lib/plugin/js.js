'use strict';

var requires = require('searequire');
var util = require('../util');
var rename = util.rename;
var template = util.template;
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

var headerTpl = 'define("{{id}}", [{{deps}}], function(require, exports, module){';
var footerTpl = '});\n';

function parser(file, options) {
  debug('filepath:%s', file.path);

  file.contents = new Buffer(transport(file, options));

  //replace filename with suffix
  file.originPath = file.originPath || file.path;
  file.path = rename(file, options);

  return file;
}

function transport(file, options) {
  var code = file.contents.toString();
  var fInfo = getFileInfo(file, options.pkg);
  var id = transportId(fInfo.originPath, fInfo.pkg, options);
  var deps = transportDeps(fInfo.originPath, fInfo.pkg, options);

  return [
    template(headerTpl, {id: id, deps: arr2str(deps)}),
    replace(code, fInfo, options) + getStyleBox(file, options),
    footerTpl
  ].join('\n');
}

function replace(code, fInfo, options) {
  var file = fInfo.pkg.files[fInfo.originPath];

  return requires(code, function(require) {
    return template('require("{{id}}")', {id: getId(require.path)});
  });

  function getId(id) {
    if (options.ignore.indexOf(id) !== -1) return id;

    var depFile = file.getDeps(id);
    if (depFile) {
      if (options.ignore.indexOf(depFile.pkg.name) !== -1) {
        return depFile.pkg.name + '/' + depFile.path;
      }

      return transportId(depFile.path, depFile.pkg, options);
    }

    // for extra deps: handlebars-runtime, import-style and so on
    var pkg_ = options.pkg.dependencies[id];
    // it's a skip package when pkg is not found
    return pkg_ ? transportId(pkg_.main, pkg_, options) : id;
  }
}

function getStyleBox(file, options) {
  var styleId = getStyleId(file, options);
  var code = options.styleBox === true && styleId ?
    'module.exports.outerBoxClass="' + styleId + '";\n' : '';
  return new Buffer(code);
}

function arr2str(arr) {
  return arr.map(function(item) {
    return '"' + item + '"';
  }).join(',');
}
