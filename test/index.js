'use strict';

require('should');
var fs = require('fs');
var join = require('path').join;
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var through2 = require('through2');
var Package = require('father').SpmPackage;
var base = join(__dirname, 'fixtures');

var transport = require('..');
var wrap = transport.cmdwrap;
var replace = transport.cmdreplace;
var util = transport.util;
var css2jsParser = transport.css2jsParser;
var jsonParser = transport.jsonParser;
var tplParser = transport.tplParser;
var handlebarsParser = transport.handlebarsParser;

describe('gulp-transport', function() {
  var map = {};
  function getPackage(name) {
    if (map[name]) return map[name];

    var dir = join(base, name);
    return (map[name] = new Package(dir));
  }

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
    var pkg = getPackage('simple-transport');
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
    var pkg = getPackage('simple-transport');
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
    var pkg = getPackage('simple-transport');
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

  it('cmdwrap', function(done) {
    var pkg = getPackage('simple-transport');
    var stream = wrap({pkg: pkg});
    var fakeBuffer = new Buffer('console.log(123)');
    var fakeFile = new gutil.File({
      path: join(base, 'simple-transport/relative3.js'),
      contents: fakeBuffer
    });

    stream.on('data', function(file) {
      var code = file.contents.toString();
      code.should.eql('define("simple-transport/1.0.0/relative3", ["d/0.1.1/index"],' +
        ' function(require, exports, module){\nconsole.log(123)\n});\n');
    });

    stream.on('end', function() {
      done();
    });

    stream.write(fakeFile);
    stream.end();
  });

  it('cmdwrap different type', function(done) {
    var pkg = getPackage('type-transport');

    var fakeCss = new gutil.File({
      path: join(base, 'type-transport/a.css'),
      contents: new Buffer('body{color: #fff;}')
    });

    var fakeJson = new gutil.File({
      path: join(base, 'type-transport/a.json'),
      contents: new Buffer('{a:1}')
    });

    var fakeTpl = new gutil.File({
      path: join(base, 'type-transport/a.tpl'),
      contents: new Buffer('<div></div>')
    });

    var stream = through2.obj(), count = 0;

    stream
    .pipe(gulpif(/\.css/, css2jsParser({pkg: pkg})))
    .pipe(gulpif(/\.json/, jsonParser({pkg: pkg})))
    .pipe(gulpif(/\.tpl/, tplParser({pkg: pkg})))
    .on('data', function(file) {
      count++;
      var code = file.contents.toString();
      if (/css$/.test(file.path)) {
        code.should.eql('define("type-transport/1.0.0/a.css", [], ' +
          'function(require, exports, module){\nseajs.importStyle("body{color: #fff;}");\n});\n');
      } else if (/json$/.test(file.path)) {
        code.should.eql('define("type-transport/1.0.0/a.json", [], ' +
          'function(require, exports, module){\nmodule.exports ={a:1}\n});\n');
      } else if (/tpl$/.test(file.path)) {
        code.should.eql('define("type-transport/1.0.0/a.tpl", [], ' +
          'function(require, exports, module){\nmodule.exports="<div></div>";\n});\n');
      }
    });

    stream.on('end', function() {
      count.should.eql(3);
      done();
    });

    stream.write(fakeCss);
    stream.write(fakeJson);
    stream.write(fakeTpl);
    stream.end();
  });

  it('cmdwrap handlebars', function(done) {
    var pkg = getPackage('type-transport');

    var fakeTpl = new gutil.File({
      path: join(base, 'type-transport/a.handlebars'),
      contents: new Buffer('<div>{{content}}</div>')
    });

    var stream = through2.obj();

    stream
    .pipe(gulpif(/\.handlebars/, handlebarsParser({pkg: pkg})))
    .on('data', function(file) {
      var code = file.contents.toString();
      code.should.eql(fs.readFileSync(__dirname + '/expected/transport-handlebars.js').toString());
    });

    stream.on('end', function() {
      done();
    });

    stream.write(fakeTpl);
    stream.end();
  });

  it('cmdwrap no parser', function() {
    var pkg = getPackage('type-transport');
    var stream = wrap({pkg: pkg});

    var fakeFile = new gutil.File({
      path: join(base, 'type-transport/a.no'),
      contents: new Buffer('123')
    });

    (function() {
      stream.write(fakeFile);
      stream.end();
    }).should.throw('extension "no" not supported.');
  });

  it('cmdwrap do not support stream', function() {
    var pkg = getPackage('type-transport');
    var stream = wrap({pkg: pkg});

    var filePath = join(base, 'type-transport/index.js');
    var fakeFile = new gutil.File({
      path: filePath,
      contents: fs.createReadStream(filePath)
    });

    (function() {
      stream.write(fakeFile);
      stream.end();
    }).should.throw('Streaming not supported.');
  });

  it('transport', function(done) {
    var pkg = getPackage('type-transport');
    var stream = transport({pkg: pkg});

    var filePath = join(base, 'type-transport/index.js');
    var fakeFile = new gutil.File({
      path: filePath,
      contents: fs.readFileSync(filePath)
    });

    stream.on('data', function(file) {
      var code = file.contents.toString();
      code.should.eql('define("type-transport/1.0.0/index", ["./a.css","./a.json","./a.tpl","./a.handlebars"], ' +
        'function(require, exports, module){\nrequire("./a.css");\nrequire("./a.json");\nrequire("./a.tpl");\nrequire(\"./a.handlebars\");\n\n});\n');
    });

    stream.on('end', function() {
      done();
    });

    stream.write(fakeFile);
    stream.end();
  });

});
