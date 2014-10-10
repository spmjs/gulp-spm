'use strict';

var path = require('path');
var join = path.join;
var through = require('through2');
var util = require('../util');
var extendOption = util.extendOption;
var template = util.template;
var common = require('../common');
var getFile = common.getFile;
var resolveIdleading = common.resolveIdleading;
var debug = require('debug')('transport:dest');

module.exports = function dest(opt) {
  opt = extendOption(opt);

  return through.obj(function(gfile, enc, cb) {
    debug('filepath:%s', gfile.path);
    var file = getFile(gfile, opt.pkg);
    var prefix = getPrefix(file, opt);

    gfile.path = join(gfile.base, prefix, relative(file.pkg.dest, gfile.path));
    this.push(gfile);
    cb();
  });
};

function getPrefix(file, opt) {
  var idleading = resolveIdleading(opt.idleading, file.path, file.pkg);
  return template(idleading, file.pkg);
}

function relative(path1, path2) {
  return util.winPath(path.relative(path1, path2));
}
