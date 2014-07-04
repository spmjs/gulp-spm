'use strict';

require('should');
var fs = require('fs');
var join = require('path').join;
var gulp = require('gulp');
var Package = require('father').SpmPackage;
var base = join(__dirname, 'fixtures');
var transport = require('../lib/transport');

describe('Transport', function() {

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

  // xit('transport css2js ignore import-style', function(done) {
  //   var fakeCss = createFile(join(base, 'type-transport/a.css'));

  //   var stream = css2jsParser({pkg: pkg, ignore:['import-style']});
  //   stream
  //   .on('data', function(file) {
  //     file.path.should.endWith('.css.js');
  //     assert(file, 'transport-css2js-ignore.js');
  //   })
  //   .on('end', done);
  //   stream.write(fakeCss);
  //   stream.end();
  // });

    // it('no handlebars deps', function(done) {
    //   var pkg = getPackage('no-handlebars');
    //   var fakeFile = createFile(join(base, 'no-handlebars/a.handlebars'));

    //   var stream = handlebarsParser({pkg: pkg})
    //   .on('data', function(file) {
    //     assert(file, 'no-handlebars.js');
    //   })
    //   .on('end', done);
    //   stream.write(fakeFile);
    //   stream.end();
    // });

  // it('check path', function(done) {
  //   var pkg = getPackage('check-path');
  //   var stream = jsParser({pkg: pkg});

  //   var filePath = join(base, 'check-path/index.js');
  //   var fakeFile = new gutil.File({
  //     path: filePath,
  //     contents: fs.readFileSync(filePath)
  //   });

  //   stream.on('data', function(file) {
  //     assert(file, 'check-path.js');
  //   })
  //   .on('end', done);

  //   stream.write(fakeFile);
  //   stream.end();
  // });

  // it('require directory', function(done) {
  //   var pkg = getPackage('require-directory');
  //   var stream = jsParser({pkg: pkg});

  //   var filePath = join(base, 'require-directory/index.js');
  //   var fakeFile = new gutil.File({
  //     path: filePath,
  //     contents: fs.readFileSync(filePath)
  //   });

  //   stream.on('data', function(file) {
  //     assert(file, 'require-directory.js');
  //   })
  //   .on('end', done);

  //   stream.write(fakeFile);
  //   stream.end();
  // });

    // it('rename with debug', function(done) {
    //   var pkg = getPackage('type-transport', {extraDeps: {handlebars: 'handlebars-runtime'}});
    //   var stream = jsParser({
    //     pkg: pkg,
    //     rename: {
    //       suffix: '-debug'
    //     }
    //   });

    //   var filePath = join(base, 'type-transport/index.js');
    //   var fakeFile = new gutil.File({
    //     path: filePath,
    //     contents: fs.readFileSync(filePath)
    //   });

    //   stream.on('data', function(file) {
    //     util.winPath(file.originPath).should.include('type-transport/index.js');
    //     util.winPath(file.path).should.include('type-transport/index-debug.js');
    //     assert(file, 'rename-debug.js');
    //   })
    //   .on('end', done);

    //   stream.write(fakeFile);
    //   stream.end();
    // });

    // it('rename with hash', function(done) {
    //   var pkg = getPackage('transport-hash');
    //   var file = join(base, 'transport-hash/index.js');
    //   var fakeTpl = new gutil.File({
    //     path: file,
    //     contents: fs.readFileSync(file)
    //   });

    //   var stream = through2.obj();

    //   stream
    //   .pipe(jsParser({
    //     pkg: pkg,
    //     rename: function(file) {
    //       var hash = utility.sha1(fs.readFileSync(file.origin)).substring(0,8);
    //       file.basename += '-' + hash;
    //       return file;
    //     }
    //   }))
    //   .on('data', function(file) {
    //     util.winPath(file.originPath).should.include('transport-hash/index.js');
    //     util.winPath(file.path).should.include('transport-hash/index-8951f677.js');
    //     assert(file, 'rename-hash.js');
    //   })
    //   .on('end', done);

    //   stream.write(fakeTpl);
    //   stream.end();
    // });

  it('rename css', function() {});
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
