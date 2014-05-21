'use strict';

require('should');
var fs = require('fs');
var join = require('path').join;
var gutil = require('gulp-util');
var Package = require('father').SpmPackage;

var transport = require('..');
var base = join(__dirname, 'fixtures');

describe('Common', function() {

  it('transportId', function() {
    var pkg, opt;
    (function() {
      transport.transportId('./a.js');
    }).should.throw('do not support relative path');

    pkg = {
      a: 1,
      b: 2,
      c: 3,
      dest: ''
    };
    opt = {
      idleading: '{{a}}-{{b}}-{{c}}',
      cwd: ''
    };
    transport.transportId('src/a', pkg, opt)
      .should.eql('1-2-3/src/a');

    pkg = {
      name: 'a',
      version: '1.0.0',
      dest: join(base, 'test')
    };
    opt = {
      idleading: '{{name}}/{{version}}'
    };
    transport.transportId('index.js', pkg, opt)
      .should.eql('a/1.0.0/index');
  });

  it('transportId with suffix', function() {
    var pkg = getPackage('type-transport', {extraDeps: {handlebars: 'handlebars'}});
    var opt = {
      rename: {suffix: '-debug'}
    };

    transport.transportId('index.js', pkg, opt)
      .should.endWith('type-transport/1.0.0/index-debug');
  });

  it('transportDeps', function() {
    var pkg = getPackage('simple-transport');
    var options = {
      idleading: '{{name}}/{{version}}'
    };
    var expected = transport.transportDeps('index.js', pkg, options);
    expected.should.eql([
      'simple-transport/1.0.0/relative1',
      'simple-transport/1.0.0/relative2',
      'd/0.1.0/index',
      'c/1.1.1/index',
      'simple-transport/1.0.0/relative3',
      'b/1.1.0/src/b',
      'd/0.1.1/index'
    ]);
  });

  it('transportDeps when ignore', function() {
    var pkg = getPackage('simple-transport');
    var options = {
      ignore: ['d'],
      idleading: '{{name}}/{{version}}'
    };
    var expected = transport.transportDeps('index.js', pkg, options);
    expected.should.eql([
      'simple-transport/1.0.0/relative1',
      'simple-transport/1.0.0/relative2',
      'd',
      'c/1.1.1/index',
      'simple-transport/1.0.0/relative3',
      'b/1.1.0/src/b'
    ]);
  });

  it('stop parsing dependencies when ignore', function() {
    var pkg = getPackage('deep-deps');
    var options = {
      ignore: ['c'],
      idleading: '{{name}}/{{version}}'
    };
    var expected = transport.transportDeps('a.js', pkg, options);
    expected.should.eql([
      'c',
      'b/1.1.0/src/b'
    ]);
  });

  it('transportDeps do not contain css\'s dependencies', function() {
    var pkg = getPackage('js-require-css');
    var deps = transport.transportDeps('index.js', pkg);
    deps.should.eql(['b/1.0.0/index.css']);
  });

  // father will throw now
  it('transportDeps which not exist in pkg.files', function() {
    var pkg = getPackage('simple-transport');
    (function() {
      transport.transportDeps('not-exist.js', pkg);
    }).should.throw('not-exist.js is not included in index.js,relative1.js,relative2.js,relative3.js');
  });

  xit('transportDeps throw when package is not found', function() {});

  xit('transportDeps throw when file is not found', function() {});

  it('generateId', function() {
    var pkg = getPackage('js-require-css');
    var fakePath = join(base, 'js-require-css/sea-modules/b/1.0.0/index.css');
    var fakeFile = new gutil.File({
      contents: fs.readFileSync(fakePath),
      path: fakePath
    });
    transport.generateId(fakeFile, {pkg: pkg})
      .should.eql('b/1.0.0/index.css');
  });

  it('generateDeps', function() {
    var pkg = getPackage('js-require-css');
    var fakePath = join(base, 'js-require-css/index.js');
    var fakeFile = new gutil.File({
      contents: fs.readFileSync(fakePath),
      path: fakePath
    });
    transport.generateDeps(fakeFile, {pkg: pkg})
      .should.eql('"b/1.0.0/index.css"');
  });

  it('getFileInfo not found', function() {
    var pkg = getPackage('js-require-css');
    var fakePath = join(base, 'js-require-css/sea-modules/b/1.0.1/index.css');
    var fakeFile = new gutil.File({
      contents: '',
      path: fakePath
    });
    (function() {
      transport.getFileInfo(fakeFile, pkg);
    }).should.throw('not found sea-modules/b/1.0.1/index.css of pkg a@1.0.0');
  });

  it('createStream', function(done) {
    var pkg = getPackage('simple-transport');
    var stream = transport.createStream({pkg: pkg}, 'js', parser);
    var fakePath = join(base, 'simple-transport/index.js');
    var fakeFile = new gutil.File({
      path: fakePath,
      contents: new Buffer('123')
    });

    stream
    .on('data', function(file) {
      file.contents.toString().should.eql('123');
    })
    .on('end', done);
    stream.write(fakeFile);
    stream.end();
  });

  it('createStream throw by parser', function(done) {
    var pkg = getPackage('simple-transport');
    var stream = transport.createStream({pkg: pkg}, 'js', function() {throw new Error('error')});
    var fakePath = join(base, 'simple-transport/index.js');
    var fakeFile = new gutil.File({
      path: fakePath,
      contents: new Buffer('123')
    });

    stream
    .on('error', function(err) {
      err.message.should.eql('error');
      done();
    });
    stream.write(fakeFile);
    stream.end();
  });

  it('createStream miss pkg', function() {
    (function() {
      transport.createStream({});
    }).should.throw('pkg missing');
  });

  it('createStream do not support stream', function() {
    var pkg = getPackage('simple-transport');
    var stream = transport.createStream({pkg: pkg}, 'js', parser);
    var filePath = join(base, 'simple-transport/index.js');
    var fakeFile = new gutil.File({
      path: filePath,
      contents: fs.createReadStream(filePath)
    });

    (function() {
      stream.write(fakeFile);
      stream.end();
    }).should.throw('Streaming not supported.');
  });

  it('createStream not supported parser', function() {
    var pkg = getPackage('simple-transport');
    var stream = transport.createStream({pkg: pkg}, 'js', parser);
    var fakeFile = new gutil.File({
      path: join(base, 'simple-transport/a.no'),
      contents: ''
    });

    (function() {
      stream.write(fakeFile);
      stream.end();
    }).should.throw('extension "no" not supported.');
  });
});

function getPackage(name, options) {
  var dir = join(base, name);
  return new Package(dir, options);
}

function parser(file) {
  return file;
}
