'use strict';

var path = require('path');
var extname = require('path').extname;
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var util = require('./util');
var transportId = util.transportId;
var transportDeps = util.transportDeps;
var extend = util.extendOption;

var headerTpl = 'define("{{id}}", [{{deps}}], function(require, exports, module){\n';
var footerTpl = '\n});\n';

var parsers = {
  js: jsParser,
  tpl: tplParser,
  html: tplParser,
  css: cssParser,
  json: jsonParser
};

module.exports = function cmdwrap(options) {
  options = extend(options);

  return through.obj(function(file, enc, callback) {
    if (file.isStream()) return callback(new PluginError('cmdwrap', 'Streaming not supported.'));

    var ext = extname(file.path).substring(1);

    if (!parsers[ext]) {
      return callback(new PluginError('cmdwrap', 'extension "' + ext + '" not supported.'));
    }

    file = parsers[ext](file, options);
    this.push(file);
    return callback();
  });
};

function jsParser(file, options) {
  var id = getId(file, options);
  var deps = getDeps(file, options);

  file.contents = Buffer.concat([
    new Buffer(util.template(headerTpl, {id: id, deps: deps})),
    file.contents,
    new Buffer(footerTpl)
  ]);
  return file;
}

function tplParser(file, options) {
  var id = getId(file, options);
  var code = file.contents.toString();

  file.contents = Buffer.concat([
    new Buffer(util.template(headerTpl, {id: id, deps: ''})),
    new Buffer('module.exports="'),
    new Buffer(code.replace(/\n|\r/g, '')),
    new Buffer('";'),
    new Buffer(footerTpl)
  ]);
  return file;
}

function cssParser(file, options) {
  var id = getId(file, options);

  file.contents = Buffer.concat([
    new Buffer(util.template(headerTpl, {id: id, deps: ''})),
    new Buffer('seajs.importStyle("'),
    file.contents,
    new Buffer('");'),
    new Buffer(footerTpl)
  ]);
  return file;
}

function jsonParser(file, options) {
  var id = getId(file, options);

  file.contents = Buffer.concat([
    new Buffer(util.template(headerTpl, {id: id, deps: ''})),
    new Buffer('module.exports ='),
    file.contents,
    new Buffer(footerTpl)
  ]);
  return file;
}

function getId(file, options) {
  var pkg = options.pkg;
  var filepath = path.relative(pkg.dest, file.path);
  return transportId(filepath, pkg, options);
}

function getDeps(file, options) {
  var pkg = options.pkg;
  var filepath = path.relative(pkg.dest, file.path);
  return transportDeps(filepath, pkg, options)
    .map(function(item) {
      return '"' + item + '"';
    }).join(',');
}
