'use strict';

var fs = require('fs');
var join = require('path').join;

module.exports = function assert(file, expectedFile) {
  var code = file.contents.toString();
  var path = join(__dirname, '../expected', expectedFile);
  code.should.eql(fs.readFileSync(path).toString().replace(/\r/g, ''));
};
