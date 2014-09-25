'use strict';

var requires = require('searequire');
var util = require('../util');
var rename = util.rename;
var template = util.template;
var common = require('../common');
var createStream = common.createStream;
var transportDeps = common.transportDeps;
var transportId = common.transportId;
var getFile = common.getFile;
var getStyleId = common.getStyleId;
var debug = require('debug')('transport:js');

module.exports = jsParser;

function jsParser(options) {
  return createStream(options, 'js', parser);
}

var headerTpl = 'define("{{id}}", [{{deps}}], function(require, exports, module){';
var footerTpl = '});\n';

function parser(gfile, options) {
  debug('filepath:%s', gfile.path);

  gfile.contents = new Buffer(transport(gfile, options));
  //replace filename with suffix
  gfile.path = rename(gfile, options);
  return gfile;
}

function transport(gfile, options) {
  var code = gfile.contents.toString();
  var file = getFile(gfile, options.pkg);
  var id = transportId(file.path, file.pkg, options);
  var deps = transportDeps(file.path, file.pkg, options);

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
