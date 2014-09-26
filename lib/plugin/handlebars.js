'use strict';

var handlebars = require('handlebars');
var join = require('path').join;
var common = require('../common');
var createStream = common.createStream;
var debug = require('debug')('transport:handlebars');

module.exports = function tplParser(options) {
  return createStream(options, 'handlebars', parser);
};

function parser(gfile, options) {
  debug('filepath:%s', gfile.path);
  var pkg = options.pkg;

  checkVersion(pkg);

  var code = 'var Handlebars = require("handlebars-runtime")["default"];\n' +
    'module.exports = Handlebars.template(' + precompile(gfile) + ');\n';
  gfile.contents = new Buffer(code);
  gfile.path += '.js';
  return gfile;
}

function precompile(gfile) {
  var code = gfile.contents.toString();
  return handlebars.precompile(code);
}

// version should be same between precompile tool and required package
function checkVersion(pkg) {
  pkg = pkg.dependencies['handlebars-runtime'];
  if (!pkg) return;
  var path = join(__dirname, '../../package.json');
  var ver = require(path).dependencies.handlebars;
  if (pkg.version !== ver) {
    throw new Error('handlebars version should be ' + ver + ' but ' + pkg.version);
  }
}
