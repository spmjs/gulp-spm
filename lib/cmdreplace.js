'use strict';

var replace = require('gulp-replace');
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
  id = util.hideExt(id);

  if (util.isRelative(id)) return id;

  var deps = options.pkg.dependencies, pkg_ = deps[id];
  if (deps[id] && options.ignore.indexOf(id) === -1) {
    id = transportId(pkg_.main, pkg_, options);
  }

  return id;
}
