'use strict';

require('should');
var fs = require('fs');
var join = require('path').join;
var gulp = require('gulp');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var through2 = require('through2');
var utility = require('utility');
var Package = require('father').SpmPackage;
var base = join(__dirname, 'fixtures');

var transport = require('..');
var wrap = transport.wrap;
var replace = transport.replace;
var util = transport.util;
var css2jsParser = transport.plugin.css2jsParser;
var jsonParser = transport.plugin.jsonParser;
var tplParser = transport.plugin.tplParser;
var handlebarsParser = transport.plugin.handlebarsParser;
var cssParser = transport.plugin.cssParser;

describe('Parser', function() {

  describe('js', function() {

    it('replace', function() {
      var pkg = getPackage('simple-transport', {entry: ['c.js']});
      var fakePath = join(base, 'simple-transport/c.js');
      var fakeFile = new gutil.File({
        contents: fs.readFileSync(fakePath),
        path: fakePath
      });

      var opt = util.extendOption({pkg: pkg});
      var code = replace(fakeFile, opt).toString();
      code.should.eql('require("simple-transport/1.0.0/a");\nrequire("b/1.1.0/src/b");\n//require("d");\n');
    });

    it('replace with options', function() {
      var pkg = getPackage('simple-transport', {entry: ['c.js']});
      var fakeFile = new gutil.File({
        contents: new Buffer('require("./a.js");\nrequire("b");\nrequire("c");'),
        path: join(base, 'simple-transport/c.js'),
      });

      var opt = {
        pkg: pkg,
        ignore: ['b'],
        idleading: '{{name}}-{{version}}'
      };
      var code = replace(fakeFile, opt).toString();
      code.should.eql('require("simple-transport-1.0.0/a");\nrequire("b");\nrequire("c-1.1.1/index");');
    });

    it('replace deep-deps', function() {
      var pkg = getPackage('deep-deps');
      var fakePath = join(base, 'deep-deps/sea-modules/c/1.1.1/index.js');
      var fakeFile = new gutil.File({
        contents: fs.readFileSync(fakePath),
        path: fakePath
      });

      var opt = util.extendOption({pkg: pkg});
      var code = replace(fakeFile, opt).toString();
      code.should.eql('require("d/0.1.0/index");\n');
    });

    it('replace relative path of dependent package', function() {
      var pkg = getPackage('simple-transport');
      var fakePath = join(base, 'simple-transport/sea-modules/b/1.1.0/src/b.js');
      var fakeFile = new gutil.File({
        contents: fs.readFileSync(fakePath),
        path: fakePath,
      });

      var opt = util.extendOption({pkg: pkg});
      var code = replace(fakeFile, opt).toString();
      code.should.eql('require("c/1.1.1/index");\nrequire("b/1.1.0/src/b.tpl");\n');
    });

    it('wrap', function() {
      var pkg = getPackage('simple-transport');
      var fakeFile = new gutil.File({
        path: join(base, 'simple-transport/relative3.js'),
        contents: new Buffer('console.log(123)')
      });

      var opt = util.extendOption({pkg: pkg});
      var buffer = wrap(fakeFile, opt);
      assert({contents: buffer}, 'cmdwrap.js');
    });

    it('transport js', function(done) {
      var pkg = getPackage('type-transport', {extraDeps: {handlebars: 'handlebars-runtime'}});
      var stream = transport({pkg: pkg});

      var filePath = join(base, 'type-transport/index.js');
      var fakeFile = new gutil.File({
        path: filePath,
        contents: fs.readFileSync(filePath)
      });

      stream.on('data', function(file) {
        assert(file, 'transport.js');
      })
      .on('end', done);

      stream.write(fakeFile);
      stream.end();
    });
  });

  describe('css2js', function() {

    var pkg = getPackage('type-transport', {
      extraDeps: {
        handlebars: 'handlebars',
        css: 'import-style'
      }
    });

    it('transport css2js', function(done) {
      var p = join(base, 'type-transport/a.css');
      var fakeCss = new gutil.File({
        path: p,
        contents: fs.readFileSync(p)
      });

      var stream = css2jsParser({pkg: pkg});
      stream
      .on('data', function(file) {
        file.path.should.endWith('.css.js');
        assert(file, 'type-transport-css.js');
      })
      .on('end', done);
      stream.write(fakeCss);
      stream.end();
    });

    it('transport css2js ignore', function(done) {
      var p = join(base, 'type-transport/a.css');
      var fakeCss = new gutil.File({
        path: p,
        contents: fs.readFileSync(p)
      });

      var stream = css2jsParser({pkg: pkg, ignore:['import-style']});
      stream
      .on('data', function(file) {
        file.path.should.endWith('.css.js');
        assert(file, 'type-transport-css-ignore.js');
      })
      .on('end', done);
      stream.write(fakeCss);
      stream.end();
    });

  });

  it('transport json', function(done) {
    var pkg = getPackage('type-transport', {extraDeps: {handlebars: 'handlebars'}});
    var fakeJson = new gutil.File({
      path: join(base, 'type-transport/a.json'),
      contents: new Buffer('{a:1}')
    });

    var stream = jsonParser({pkg: pkg});
    stream
    .on('data', function(file) {
      file.path.should.endWith('.json.js');
      assert(file, 'type-transport-json.js');
    })
    .on('end', done);
    stream.write(fakeJson);
    stream.end();
  });

  it('transport tpl', function(done) {
    var pkg = getPackage('type-transport', {extraDeps: {handlebars: 'handlebars'}});
    var fakeTpl = new gutil.File({
      path: join(base, 'type-transport/a.tpl'),
      contents: new Buffer('<div></div>')
    });

    var stream = tplParser({pkg: pkg});
    stream
    .on('data', function(file) {
      file.path.should.endWith('.tpl.js');
      assert(file, 'type-transport-tpl.js');
    })
    .on('end', done);
    stream.write(fakeTpl);
    stream.end();
  });

  describe('handlebars', function() {

    it('transport handlebars', function(done) {
      var pkg = getPackage('type-transport', {extraDeps: {handlebars: 'handlebars-runtime'}});

      var fakeTpl = new gutil.File({
        path: join(base, 'type-transport/a.handlebars'),
        contents: new Buffer('<div>{{content}}</div>')
      });

      var stream = through2.obj();

      stream
      .pipe(gulpif(/\.handlebars/, handlebarsParser({pkg: pkg})))
      .on('data', function(file) {
        file.path.should.endWith('.handlebars.js');
        assert(file, 'transport-handlebars.js');
      })
      .on('end', done);

      stream.write(fakeTpl);
      stream.end();
    });

    it('transport handlebars not match', function(done) {
      var pkg = getPackage('handlebars-not-match');

      var fakeTpl = new gutil.File({
        path: join(base, 'handlebars-not-match/a.handlebars'),
        contents: new Buffer('<div>{{content}}</div>')
      });

      var count = 0;
      var stream = through2.obj();
      var plugin = handlebarsParser({pkg: pkg});
      plugin.on('error', function(e) {
        count++;
        e.plugin.should.eql('transport:handlebars');
        e.message.should.eql('handlebars version should be 1.3.0 but 1.2.0');
        done();
      });

      stream
      .pipe(gulpif(/\.handlebars/, plugin));

      stream.write(fakeTpl);
      stream.end();
    });

    it('no handlebars deps', function(done) {
      var pkg = getPackage('no-handlebars');

      var fakeTpl = new gutil.File({
        path: join(base, 'no-handlebars/a.handlebars'),
        contents: new Buffer('<div>{{content}}</div>')
      });

      var stream = through2.obj();

      stream
      .pipe(gulpif(/\.handlebars/, handlebarsParser({pkg: pkg})))
      .on('data', function(file) {
        assert(file, 'no-handlebars.js');
      })
      .on('end', done);

      stream.write(fakeTpl);
      stream.end();
    });

  });

  describe('css', function() {

    it('css import', function(done) {
      var pkg = getPackage('css-import');

      var main = join(pkg.dest, pkg.main);
      var fakeTpl = new gutil.File({
        path: main,
        contents: fs.readFileSync(main)
      });

      var stream = through2.obj();

      stream
      .pipe(cssParser({pkg: pkg}))
      .on('data', function(file) {
        assert(file, 'css-imports.css');
      })
      .on('end', done);

      stream.write(fakeTpl);
      stream.end();
    });

    it('transport css import ignore', function(done) {
      var pkg = getPackage('css-import');

      var fakePath = join(pkg.dest, pkg.main);
      var fakeTpl = new gutil.File({
        path: fakePath,
        contents: fs.readFileSync(fakePath)
      });

      var stream = through2.obj();

      stream
      .pipe(cssParser({pkg: pkg, ignore: ['b']}))
      .on('data', function(file) {
        assert(file, 'css-imports-ignore.css');
      })
      .on('end', done);

      stream.write(fakeTpl);
      stream.end();
    });

    it('transport css import error', function(done) {
      var pkg = getPackage('css-import');

      var fakePath = join(pkg.dest, 'a5.css');
      var fakeTpl = new gutil.File({
        path: fakePath,
        contents: fs.readFileSync(fakePath)
      });

      var stream = through2.obj();

      stream
      .pipe(cssParser({pkg: pkg}))
      .on('error', function(e) {
        e.message.should.eql('package c not exists');
        e.plugin.should.eql('transport:css');
        done();
      });

      stream.write(fakeTpl);
      stream.end();
    });

    it('transport css conflict', function(done) {
      var pkg = getPackage('css-conflict');

      gulp.src(join(pkg.dest, pkg.main))
        .pipe(cssParser({pkg: pkg}))
        .on('error', function(e) {
          e.plugin.should.eql('transport:css');
          e.message.should.eql('c@1.0.0 conflict with c@1.0.1');
          done();
        });
    });
  });

  describe('rename', function() {
    it('rename with debug', function(done) {
      var pkg = getPackage('type-transport', {extraDeps: {handlebars: 'handlebars-runtime'}});
      var stream = transport({
        pkg: pkg,
        rename: {
          suffix: '-debug'
        }
      });

      var filePath = join(base, 'type-transport/index.js');
      var fakeFile = new gutil.File({
        path: filePath,
        contents: fs.readFileSync(filePath)
      });

      stream.on('data', function(file) {
        util.winPath(file.originPath).should.include('type-transport/index.js');
        util.winPath(file.path).should.include('type-transport/index-debug.js');
        assert(file, 'rename-debug.js');
      })
      .on('end', done);

      stream.write(fakeFile);
      stream.end();
    });

    it('rename with hash', function(done) {
      var pkg = getPackage('transport-hash');
      var file = join(base, 'transport-hash/index.js');
      var fakeTpl = new gutil.File({
        path: file,
        contents: fs.readFileSync(file)
      });

      var stream = through2.obj();

      stream
      .pipe(transport({
        pkg: pkg,
        rename: function(file) {
          var hash = utility.sha1(fs.readFileSync(file.origin)).substring(0,8);
          file.basename += '-' + hash;
          return file;
        }
      }))
      .on('data', function(file) {
        util.winPath(file.originPath).should.include('transport-hash/index.js');
        util.winPath(file.path).should.include('transport-hash/index-8951f677.js');
        assert(file, 'rename-hash.js');
      })
      .on('end', done);

      stream.write(fakeTpl);
      stream.end();
    });
  });


  it('check path', function(done) {
    var pkg = getPackage('check-path');
    var stream = transport({pkg: pkg});

    var filePath = join(base, 'check-path/index.js');
    var fakeFile = new gutil.File({
      path: filePath,
      contents: fs.readFileSync(filePath)
    });

    stream.on('data', function(file) {
      assert(file, 'check-path.js');
    })
    .on('end', done);

    stream.write(fakeFile);
    stream.end();
  });

  it('require directory', function(done) {
    var pkg = getPackage('require-directory');
    var stream = transport({pkg: pkg});

    var filePath = join(base, 'require-directory/index.js');
    var fakeFile = new gutil.File({
      path: filePath,
      contents: fs.readFileSync(filePath)
    });

    stream.on('data', function(file) {
      assert(file, 'require-directory.js');
    })
    .on('end', done);

    stream.write(fakeFile);
    stream.end();
  });

  describe('stylebox', function() {

    it('stylebox js', function(done) {
      var pkg = getPackage('stylebox');
      var stream = transport({pkg: pkg, styleBox: true});

      var filePath = join(base, 'stylebox/index.js');
      var fakeFile = new gutil.File({
        path: filePath,
        contents: fs.readFileSync(filePath)
      });

      stream.on('data', function(file) {
        assert(file, 'stylebox.js');
      })
      .on('end', done);

      stream.write(fakeFile);
      stream.end();
    });

    it('stylebox css2js', function(done) {
      var pkg = getPackage('stylebox');
      var stream = css2jsParser({pkg: pkg, styleBox: true});

      var filePath = join(base, 'stylebox/index.css');
      var fakeFile = new gutil.File({
        path: filePath,
        contents: fs.readFileSync(filePath)
      });

      stream.on('data', function(file) {
        assert(file, 'stylebox.css.js');
      })
      .on('end', done);

      stream.write(fakeFile);
      stream.end();
    });
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
