'use strict';

var handlebars = require('handlebars');
var join = require('path').join;
var util = require('../util');
var getId = util.getId;
var transportId= util.transportId;
var createStream = util.createStream;
var PluginError = require('gulp-util').PluginError;

module.exports = function tplParser(options) {
  return createStream(options, 'handlebars', parser);
};

var headerTpl = 'define("{{id}}", ["{{handlebars}}"], function(require, exports, module) {\n' +
  'var Handlebars = require("{{handlebars}}");\n';
var footerTpl = '\n});\n';

function parser(file, options) {
  var id = getId(file, options);
  var pkg = options.pkg;
  var hid, hpkg = pkg.dependencies['handlebars'];
  if (hpkg) {
    var ver = require(join(__dirname + '../../../package.json')).dependencies.handlebars;
    if (hpkg.version !== ver) {
      throw new PluginError('transport:handlebars', 'handlebars version should be ' + ver + ' but ' + hpkg.version);
    }
    hid = transportId(hpkg.main, hpkg, options);
  } else {
    hid = 'handlebars';
  }

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

