'use strict';

var handlebars = require('handlebars');
var join = require('path').join;
var common = require('../common');
var createStream = common.createStream;
var PluginError = require('gulp-util').PluginError;
var debug = require('debug')('transport:handlebars');

module.exports = function tplParser(options) {
  return createStream(options, 'handlebars', parser);
};

function parser(file, options) {
  debug('filepath:%s', file.path);
  var pkg = options.pkg;

  checkVersion(pkg);

  var code = 'var Handlebars = require("handlebars-runtime")["default"];\n' +
    'module.exports = Handlebars.template(' + precompile(file) + ');\n';
  file.contents = new Buffer(code);
  file.originPath = file.path;
  file.path += '.js';
  return file;
}

function precompile(file) {
  var code = file.contents.toString();
  return handlebars.precompile(code);
}

// version should be same between precompile tool and required package
function checkVersion(pkg) {
  pkg = pkg.dependencies['handlebars-runtime'];
  if (!pkg) return;
  var path = join(__dirname, '../../package.json');
  var ver = require(path).dependencies.handlebars;
  if (pkg.version !== ver) {
    throw new PluginError('transport:handlebars', 'handlebars version should be ' + ver + ' but ' + pkg.version);
  }
}
