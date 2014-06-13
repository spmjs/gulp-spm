'use strict';

var handlebars = require('handlebars');
var join = require('path').join;
var util = require('../util');
var common = require('../common');
var createStream = common.createStream;
var generateId = common.generateId;
var transportId= common.transportId;
var PluginError = require('gulp-util').PluginError;

module.exports = function tplParser(options) {
  return createStream(options, 'handlebars', parser);
};

var headerTpl = 'define("{{id}}", ["{{handlebars}}"], function(require, exports, module) {\n' +
  'var Handlebars = require("{{handlebars}}")["default"];\n';
var footerTpl = '\n});\n';

function parser(file, options) {
  var ignore = options.ignore;
  var id = generateId(file, options);
  var pkg = options.pkg;
  var hpkg = pkg.dependencies['handlebars-runtime'];

  // version should be same between precompile tool and required package
  check(hpkg);

  var hid = ignore.indexOf('handlebars-runtime') === -1 && hpkg ?
    transportId(hpkg.main, hpkg, options) : 'handlebars-runtime';
  file.contents = Buffer.concat([
    new Buffer(util.template(headerTpl, {id: id, handlebars: hid})),
    new Buffer('module.exports = Handlebars.template('),
    new Buffer(precompile(file, hid)),
    new Buffer(');'),
    new Buffer(footerTpl)
  ]);
  return file;
}

function precompile(file) {
  var code = file.contents.toString();
  return handlebars.precompile(code);
}

function check(pkg) {
  if (!pkg) return;
  var path = join(__dirname + '../../../package.json');
  var ver = require(path).dependencies.handlebars;
  if (pkg.version !== ver) {
    throw new PluginError('transport:handlebars', 'handlebars version should be ' + ver + ' but ' + pkg.version);
  }
}
