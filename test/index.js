'use strict';

var join = require('path').join;
var should = require('should');
var gulp = require('gulp');
var gutil = require('gulp-util');
var Package = require('father').SpmPackage;
var base = join(__dirname, 'fixtures');

var transport = require('..');
var wrap = transport.cmdwrap;
var replace = transport.cmdreplace;
var util = transport.util;

describe('gulp-transport', function() {
  var dir = join(base, 'relative-transport');
  var pkg = new Package(dir);

  it('util.transportId', function() {
    var pkg = {a: 1, b: 2, c: 3};
    var options = {
      idleading: '{{a}}-{{b}}-{{c}}'
    };
    var expected = util.transportId('src/a', pkg, options);
    expected.should.eql('1-2-3/src/a');
  });

  it('util.extendOption', function() {
    (function(){
      util.extendOption();
    }).should.throw();

    util.extendOption({pkg: {}}).should.eql({
      pkg: {},
      ignore: [],
      idleading: '{{name}}/{{version}}'
    });
  });

  it('util.template', function() {
    util.template().should.eql('');
    util.template('{{a}}/{{b}}', {a: 1})
      .should.eql('1/');
  });

  it('util.transportDeps', function() {
    var options = {
      ignore: ['d'],
      idleading: '{{name}}/{{version}}'
    };
    var expected = util.transportDeps('index.js', pkg, options);
    expected.should.eql([
      './relative1',
      './relative2',
      'd',
      'c/1.1.1/index',
      'not-exist',
      './relative3',
      './b.tpl',
      'b/1.1.0/src/b'
    ]);
  });

  it('cmdreplace', function(done) {
    var stream = replace({pkg: pkg});
    var fakeBuffer = new Buffer('require("./a");\nrequire("b")');
    var fakeFile = new gutil.File({
      contents: fakeBuffer
    });

    stream.on('data', function(file) {
      var code = file.contents.toString();
      code.should.eql('require("./a");\nrequire("b/1.1.0/src/b")');
    });

    stream.on('end', function() {
      done();
    });

    stream.write(fakeFile);
    stream.end();
  });

  it('cmdreplace with options', function(done) {
    var stream = replace({
      pkg: pkg,
      ignore: ['b'],
      idleading: '{{name}}-{{version}}'
    });
    var fakeBuffer = new Buffer('require("./a.js");\nrequire("b");\nrequire("c");');
    var fakeFile = new gutil.File({
      contents: fakeBuffer
    });

    stream.on('data', function(file) {
      var code = file.contents.toString();
      code.should.eql('require("./a");\nrequire("b");\nrequire("c-1.1.1/index");');
    });

    stream.on('end', function() {
      done();
    });

    stream.write(fakeFile);
    stream.end();
  });

  it('simple transport', function(done) {
    var dir = join(base, 'relative-transport');
    var pkg = new Package(dir);
    var stream = transport({
      pkg: pkg
    });

    gulp.src(pkg.main, {cwd: dir})
      .pipe(stream)
      .on('data', function(file) {
        console.log(file.contents.toString());
      })
      .on('end', function() {
        done();
      });
  });

  it('has dependency', function() {

  });
});
