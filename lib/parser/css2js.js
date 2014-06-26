'use strict';

var util = require('../util');
var common = require('../common');
var strip = require('strip-comments');
var generateId = common.generateId;
var createStream = common.createStream;
var getStyleId = common.getStyleId;
var transportId= common.transportId;
var cssParse = require('css').parse;
var cssStringify = require('css').stringify;

module.exports = function css2jsParser(options) {
  return createStream(options, 'css', parser);
};

var headerTpl = 'define("{{id}}", ["{{importstyle}}"], function(require, exports, module){\n';
var footerTpl = '\n});\n';

function parser(file, options) {
  var ignore = options.ignore;
  var id = generateId(file, options);
  var code = file.contents.toString();

  var pkg = options.pkg;
  var importStylePkg = pkg.dependencies['import-style'];

  var importStyleId = ignore.indexOf('import-style') === -1 ?
    transportId(importStylePkg.main, importStylePkg, options) : 'import-style';

  file.contents = Buffer.concat([
    new Buffer(util.template(headerTpl, {id: id, importstyle: importStyleId})),
    new Buffer('require(\'import-style\')(\''),
    new Buffer(css2js(code, file, options)),
    new Buffer('\');'),
    new Buffer(footerTpl)
  ]);
  return file;
}

function css2js(code, file, options) {

  if (options.styleBox === true) {
    var styleId = getStyleId(file, options);
    var prefix = ['.', styleId, ' '].join('');
    var data = cssParse(code);
    data.stylesheet.rules = parseRules(data.stylesheet.rules, prefix);
    code = cssStringify(data);
  }

  code = strip
    .block(code)
    .replace(/\n|\r/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, '"');

  return code;
}

function parseRules(rules, prefix) {
  return rules.map(function(o) {
    if (o.selectors) {
      o.selectors = o.selectors.map(function(selector) {
        // handle :root selector {}
        if (selector.indexOf(':root') === 0) {
          return ':root ' + prefix + selector.replace(':root', ' ');
        }
        return prefix + selector;
      });
    }
    if (o.rules) {
      o.rules = parseRules(o.rules, prefix);
    }
    return o;
  });
}
