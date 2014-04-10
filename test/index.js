'use strict';

require('should');
var fs = require('fs');
var join = require('path').join;
var gulp = require('gulp');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var through2 = require('through2');
var Package = require('father').SpmPackage;
var base = join(__dirname, 'fixtures');

var transport = require('..');
var wrap = transport.wrap;
var replace = transport.replace;
var util = transport.util;
var css2jsParser = transport.css2jsParser;
var jsonParser = transport.jsonParser;
var tplParser = transport.tplParser;
var handlebarsParser = transport.handlebarsParser;
var cssParser = transport.cssParser;

describe('gulp-transport', function() {

  it('util.transportId', function() {
    var expected = util.transportId(
      'src/a', {
        a: 1,
        b: 2,
        c: 3
      }, {
        idleading: '{{a}}-{{b}}-{{c}}',
        cwd: ''
      }
    );
    expected.should.eql('1-2-3/src/a');

    var pkg = getPackage('transport-id-error');
    var tid = util.transportId;
    var options = {
      idleading: '{{name}}/{{version}}'
    };
    tid('index.js', pkg, options).should.eql('a/1.0.0/index');

    (function() {
      tid('./a.js', pkg, options);
    }).should.throw('no base path of ./a.js');

    (function() {
      tid('../a.js', pkg, options, 'index.js');
    }).should.throw('../a.js is out of bound');
  });

  it('util.extendOption', function() {
    util.extendOption().should.eql({
      ignore: [],
      idleading: '{{name}}/{{version}}',
      cwd: process.cwd(),
      pkg: null
    });

    var orig = {pkg: {}};
    util.extendOption(orig).should.eql({
      pkg: {},
      ignore: [],
      idleading: '{{name}}/{{version}}',
      cwd: process.cwd()
    });
    orig.should.eql({pkg: {}});
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
      'simple-transport/1.0.0/relative1',
      'simple-transport/1.0.0/relative2',
      'simple-transport/1.0.0/relative3',
      'd',
      'c/1.1.1/index',
      'b/1.1.0/src/b',
      'not-exist'
    ]);
  });

  it('replace', function() {
    var pkg = getPackage('simple-transport');
    var fakeBuffer = new Buffer('require("./a");\nrequire("b")');
    var fakeFile = new gutil.File({
      contents: fakeBuffer,
      path: join(base, 'simple-transport/c.js'),
    });

    var opt = util.extendOption({pkg: pkg});
    var code = replace(fakeFile, opt).toString();
    code.should.eql('require("simple-transport/1.0.0/a");\nrequire("b/1.1.0/src/b")');
  });

  it('replace with options', function() {
    var pkg = getPackage('simple-transport');
    var fakeBuffer = new Buffer('require("./a.js");\nrequire("b");\nrequire("c");');
    var fakeFile = new gutil.File({
      contents: fakeBuffer,
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

  it('replace relative path of dependent package', function() {
    var pkg = getPackage('simple-transport');
    var path = join(base, 'simple-transport/sea-modules/b/1.1.0/src/b.js');
    var fakeFile = new gutil.File({
      contents: fs.readFileSync(path),
      path: path,
    });

    var opt = util.extendOption({pkg: pkg});
    var code = replace(fakeFile, opt).toString();
    code.should.eql('require("c/1.1.1/index");\nrequire("b/1.1.0/src/b.tpl");\n');
  });

  it('wrap', function() {
    var pkg = getPackage('simple-transport');
    var fakeBuffer = new Buffer('console.log(123)');
    var fakeFile = new gutil.File({
      path: join(base, 'simple-transport/relative3.js'),
      contents: fakeBuffer
    });

    var opt = util.extendOption({pkg: pkg});
    var buffer = wrap(fakeFile, opt);
    assert({contents: buffer}, 'cmdwrap.js');

  });

  it('transport different type', function(done) {
    var pkg = getPackage('type-transport', {extraDeps: {handlebars: 'handlebars'}});

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
      if (/css$/.test(file.path)) {
        assert(file, 'type-transport-css.js');
      } else if (/json$/.test(file.path)) {
        assert(file, 'type-transport-json.js');
      } else if (/tpl$/.test(file.path)) {
        assert(file, 'type-transport-tpl.js');
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

  it('transport handlebars', function(done) {
    var pkg = getPackage('type-transport', {extraDeps: {handlebars: 'handlebars'}});

    var fakeTpl = new gutil.File({
      path: join(base, 'type-transport/a.handlebars'),
      contents: new Buffer('<div>{{content}}</div>')
    });

    var stream = through2.obj();

    stream
    .pipe(gulpif(/\.handlebars/, handlebarsParser({pkg: pkg})))
    .on('data', function(file) {
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
    });

    stream
    .pipe(gulpif(/\.handlebars/, plugin))
    .on('end', function() {
      count.should.eql(1);
      done();
    });

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

  it('transport no parser', function() {
    var pkg = getPackage('type-transport', {extraDeps: {handlebars: 'handlebars'}});
    var stream = transport({pkg: pkg});

    var fakeFile = new gutil.File({
      path: join(base, 'type-transport/a.no'),
      contents: new Buffer('123')
    });

    (function() {
      stream.write(fakeFile);
      stream.end();
    }).should.throw('extension "no" not supported.');
  });

  it('transport do not support stream', function() {
    var pkg = getPackage('type-transport', {extraDeps: {handlebars: 'handlebars'}});
    var stream = transport({pkg: pkg});

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

  it('css import ignore', function(done) {
    var pkg = getPackage('css-import');

    var main = join(pkg.dest, pkg.main);
    var fakeTpl = new gutil.File({
      path: main,
      contents: fs.readFileSync(main)
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

  it('css import error', function(done) {
    var pkg = getPackage('css-import');

    var path = join(pkg.dest, 'a5.css');
    var fakeTpl = new gutil.File({
      path: path,
      contents: fs.readFileSync(path)
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

  it('transport', function(done) {
    var pkg = getPackage('type-transport', {extraDeps: {handlebars: 'handlebars'}});
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

  it('generateId', function(done) {
    var pkg = getPackage('js-require-css');
    var b = pkg.dependencies['b'];

    gulp.src(join(b.dest, b.main), {base: join(base, 'js-require-css')})
      .on('data', function(file) {
        var id = util.generateId(file, {pkg: pkg});
        id.should.eql('b/1.0.0/index.css');
      })
      .on('end', done);
  });

  it('transportDeps', function() {
    var pkg = getPackage('js-require-css');

    var deps = util.transportDeps('index.js', pkg, {ignore: []});
    deps.should.eql(['b/1.0.0/index.css']);
  });

  it('css conflict', function(done) {
    var pkg = getPackage('css-conflict');

    gulp.src(join(pkg.dest, pkg.main))
      .pipe(cssParser({pkg: pkg}))
      .on('error', function(e) {
        e.plugin.should.eql('transport:css');
        e.message.should.eql('c@1.0.0 conflict with c@1.0.1');
        done();
      });
  });

  it('transport file deps which not contains in pkg.files', function() {
    var pkg = getPackage('simple-transport');
    (function() {
      util.transportDeps('not-exist.js', pkg);
    }).should.throw('not-exist.js is not included in relative3.js,relative2.js,relative1.js,index.js');
  });

  it('transportId with suffix', function(done) {
    var pkg = getPackage('type-transport', {extraDeps: {handlebars: 'handlebars'}});
    var stream = transport({
      pkg: pkg,
      include: 'self',
      rename: {suffix: '-debug'}
    });

    var filePath = join(base, 'type-transport/index.js');
    var fakeFile = new gutil.File({
      path: filePath,
      contents: fs.readFileSync(filePath)
    });

    stream.on('data', function(file) {
      file.path.should.endWith('index-debug.js');
      assert(file, 'transport-suffix.js');
    })
    .on('end', done);

    stream.write(fakeFile);
    stream.end();
  });

  it('rename error when transport', function(done) {
    var pkg = getPackage('type-transport', {extraDeps: {handlebars: 'handlebars'}});
    var stream = transport({
      pkg: pkg,
      include: 'self',
      rename: function() {
        throw new Error();
      }
    });

    var filePath = join(base, 'type-transport/index.js');
    var fakeFile = new gutil.File({
      path: filePath,
      contents: fs.readFileSync(filePath)
    });

    stream.on('data', function(file) {
      file.path.should.endWith('index.js');
      assert(file, 'transport.js');
    })
    .on('end', done);

    stream.write(fakeFile);
    stream.end();
  });

  it('pkg missing', function() {
    (function() {
      transport();
    }).should.throw('pkg missing');
  });
});

var map = {};
function getPackage(name, options) {
  if (map[name]) return map[name];

  var dir = join(base, name);
  return (map[name] = new Package(dir, options));
}

function assert (file, expectedFile) {
  var code = file.contents.toString();
  var expected = fs.readFileSync(__dirname + '/expected/' + expectedFile).toString();
  code.should.eql(expected);
}
