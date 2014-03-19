'use strict';

var replace = require('gulp-replace');
var extname = require('path').extname;
var util = require('./util');
var template = util.template;
var transportId = util.transportId;
var extend = util.extendOption;

/*
  replace require id
*/

module.exports = function cmdreplace(options) {
  options = extend(options);

  var reg = /require\(["']([a-zA-Z0-9-\.\/_]*)["']\)/g;
  return replace(reg, function(all, match) {
    var id = replaceId(match, options);
    return template('require("{{id}}")', {id: id});
  });
};

function replaceId(id, options) {
  if (extname(id) === '.js') {
    id = id.replace('.js', '');
  }

  if (id.charAt(0) === '.' || id.charAt(0) === '/') return id;

  var deps = options.pkg.dependencies, p = deps[id];
  if (deps[id] && options.ignore.indexOf(id) === -1) {
    id = transportId(p.main, p, options);
  }

  return id;
}
