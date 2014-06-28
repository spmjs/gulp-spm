'use strict';

require('should');
var fs = require('fs');
var join = require('path').join;
var gulp = require('gulp');
var Package = require('father').SpmPackage;
var base = join(__dirname, 'fixtures');
var transport = require('../lib/transport');

describe.only('Transport', function() {

  it('transport js relative', function(done) {
    var pkg = getPackage('type-transport', {
      extraDeps: {
        handlebars: 'handlebars-runtime',
        css: 'import-style'
      }
    });

    var opt = {
      cwd: join(base, 'type-transport'),
      cwdbase: true
    };
    gulp.src('index.js', opt)
    .pipe(transport({pkg: pkg}))
    .on('data', function(file) {
      assert(file, 'transport-relative.js');
    })
    .on('end', done);
  });

  it('transport css', function(done) {
    var pkg = getPackage('css-import', {
      extraDeps: {
        handlebars: 'handlebars-runtime',
        css: 'import-style'
      }
    });

    var opt = {
      cwd: join(base, 'css-import'),
      cwdbase: true
    };
    gulp.src('index.css', opt)
    .pipe(transport({pkg: pkg}))
    .on('data', function(file) {
      assert(file, 'css-imports.css');
    })
    .on('end', done);
  });
});

function getPackage(name, options) {
  var dir = join(base, name);
  return new Package(dir, options);
}

function assert(file, expectedFile) {
  var code = file.contents.toString();
  var expected = readFile(__dirname + '/expected/' + expectedFile);
  code.should.eql(expected);
}

function readFile(path) {
  return fs.readFileSync(path).toString().replace(/\r/g, '');
}
