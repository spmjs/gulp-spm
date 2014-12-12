'use strict';

var requires = require('crequire');
var util = require('../util');
var rename = util.rename;
var template = util.template;
var common = require('../common');
var createStream = common.createStream;
var transportDeps = common.transportDeps;
var transportId = common.transportId;
var getStyleId = common.getStyleId;
var debug = require('debug')('transport:js');

module.exports = jsParser;

function jsParser(options) {
  return createStream(options, 'js', parser);
}

var headerTpl = 'define("{{id}}", [{{deps}}], function(require, exports, module){';
var footerTpl = '});\n';

function parser(gfile, options) {
  gfile.contents = new Buffer(transport(gfile, options));
  gfile.path = rename(gfile, options);
  return gfile;
}

function transport(gfile, options) {
  var file = gfile.file;
  var code = gfile.contents.toString();
  var id = transportId(file, options);
  var deps = transportDeps(file, options);
  debug('filepath:%s id(%s) deps(%s)', file.path, id, deps);

  return [
    template(headerTpl, {id: id, deps: arr2str(deps)}),
    replace(code, file, options) + getStyleBox(file, options),
    footerTpl
  ].join('\n');
}

function replace(code, file, options) {
  return requires(code, function(require) {
    return template('require("{{id}}")', {id: getId(require.path)});
  });

  function getId(id) {
    var depFile = file.getDeps(id);
    if (depFile) {
      return depFile.ignore ? id : transportId(depFile, options);
    }

    // for extra deps: handlebars-runtime, import-style and so on
    var pkg_ = options.pkg.dependencies[id];
    // it's a skip package when pkg is not found
    if (!pkg_) return id;
    depFile = pkg_.files[pkg_.main];
    return (!depFile || depFile.ignore) ? id : transportId(depFile, options);
  }
}

function getStyleBox(file, options) {
  var styleId = getStyleId(file, options);
  debug('filepath: %s, styleBox: %s, styleId: %s', file.fullpath, options.styleBox, styleId);
  return options.styleBox === true && styleId ?
    'module.exports.outerBoxClass="' + styleId + '";\n' : '';
}

function arr2str(arr) {
  return arr.map(function(item) {
    return '"' + item + '"';
  }).join(',');
}
