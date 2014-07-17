'use strict';

var join = require('path').join;
var through = require('through2');
var util = require('../util');
var extendOption = util.extendOption;
var template = util.template;
var common = require('../common');
var getFileInfo = common.getFileInfo;
var resolveIdleading = common.resolveIdleading;
var debug = require('debug')('transport:dest');

module.exports = function dest(opt) {
  opt = extendOption(opt);

  return through.obj(function(file, enc, cb) {
    var fInfo = getFileInfo(file, opt.pkg);
    var prefix = getPrefix(fInfo, opt);

    file.path = join(file.base, prefix, file.relative);
    debug('filepath:%s', file.path);
    this.push(file);
    cb();
  });
};

function getPrefix(fInfo, opt) {
  var idleading = resolveIdleading(opt.idleading, fInfo.filepath, fInfo.pkg);
  return template(idleading, fInfo.pkg);
}
