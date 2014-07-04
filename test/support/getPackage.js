'use strict';

var join = require('path').join;
var base = join(__dirname, '../fixtures');
var Package = require('father').SpmPackage;

module.exports = function getPackage(name, options) {
  var dir = join(base, name);
  return new Package(dir, options);
};
