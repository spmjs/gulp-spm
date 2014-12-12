'use strict';

var join = require('path').join;
var base = join(__dirname, '../fixtures');
var Package = require('father').SpmPackage;

module.exports = function getPackage(name, options) {
  var dir = join(base, name);
  options || (options = {});
  options.moduleDir = 'sea-modules';
  return new Package(dir, options);
};
