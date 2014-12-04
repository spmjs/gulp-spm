'use strict';

var requires = require('searequire');
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
  var code = gfile.contents.toString();
  var file = gfile.file;
  var id = transportId(file, options);
  var deps = transportDeps(file, options);
  debug('filepath:%s id(%s) deps(%s)', gfile.path, id, deps);

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
    if (options.ignore.indexOf(id) !== -1) return id;

    var depFile = file.getDeps(id);
    if (depFile) {
      if (options.ignore.indexOf(depFile.pkg.name) !== -1) {
        return depFile.pkg.name + '/' + depFile.path;
      }

      return transportId(depFile, options);
    }

    // for extra deps: handlebars-runtime, import-style and so on
    var pkg_ = options.pkg.dependencies[id];
    // it's a skip package when pkg is not found
    return pkg_ ? transportId(pkg_.files[pkg_.main], options) : id;
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
