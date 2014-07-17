'use strict';

require('should');
var fs = require('fs');
var join = require('path').join;
var gulp = require('gulp');
var utility = require('utility');
var Package = require('father').SpmPackage;
var base = join(__dirname, 'fixtures');
var transport = require('../lib/transport');
var plugin = require('../lib/plugin');
var util = require('../lib/util');

describe('Transport', function() {

  it('transport all', function(done) {
    var pkg = getPackage('simple-transport');

    var opt = {
      cwd: join(base, 'simple-transport'),
      cwdbase: true
    };

    gulp.src(pkg.main, opt)
    .pipe(transport({pkg: pkg, include: 'all', ignore: ['b']}))
    .on('data', function(file) {
      assert(file, 'transport-all.js');
      done();
    });
  });

  // https://github.com/popomore/gulp-transport/issues/5
  describe('include', function() {

    it('self', function(done) {
      var pkg = getPackage('js-require-js');

      var opt = {
        cwd: join(base, 'js-require-js'),
        cwdbase: true
      };

      gulp.src(pkg.main, opt)
      .pipe(transport({pkg: pkg, include: 'self'}))
      .on('data', function(file) {
        assert(file, 'transport-include-self.js');
        done();
      });
    });

    it('self with ignore', function(done) {
      var pkg = getPackage('js-require-js');

      var opt = {
        cwd: join(base, 'js-require-js'),
        cwdbase: true
      };

      gulp.src(pkg.main, opt)
      .pipe(transport({pkg: pkg, include: 'self', ignore: ['b']}))
      .on('data', function(file) {
        assert(file, 'transport-include-self-ignore.js');
        done();
      });
    });

    it('self with css', function(done) {
      var pkg = getPackage('js-require-css');

      var opt = {
        cwd: join(base, 'js-require-css'),
        cwdbase: true
      };

      gulp.src(pkg.main, opt)
      .pipe(transport({pkg: pkg, include: 'self'}))
      .on('data', function(file) {
        assert(file, 'transport-include-self-css.js');
        done();
      });
    });

    it('relative', function(done) {
      var pkg = getPackage('js-require-js');

      var opt = {
        cwd: join(base, 'js-require-js'),
        cwdbase: true
      };

      gulp.src(pkg.main, opt)
      .pipe(transport({pkg: pkg, include: 'relative'}))
      .on('data', function(file) {
        assert(file, 'transport-include-relative.js');
        done();
      });
    });


    it('relative with ignore', function(done) {
      var pkg = getPackage('js-require-js');

      var opt = {
        cwd: join(base, 'js-require-js'),
        cwdbase: true
      };

      gulp.src(pkg.main, opt)
      .pipe(transport({pkg: pkg, include: 'relative', ignore: ['b']}))
      .on('data', function(file) {
        assert(file, 'transport-include-relative-ignore.js');
        done();
      });
    });

    it('relative with css', function(done) {
      var pkg = getPackage('js-require-css');

      var opt = {
        cwd: join(base, 'js-require-css'),
        cwdbase: true
      };

      gulp.src(pkg.main, opt)
      .pipe(transport({pkg: pkg, include: 'relative'}))
      .on('data', function(file) {
        assert(file, 'transport-include-relative-css.js');
        done();
      });
    });

    it('relative with css ignore', function(done) {
      var pkg = getPackage('js-require-css');

      var opt = {
        cwd: join(base, 'js-require-css'),
        cwdbase: true
      };

      gulp.src(pkg.main, opt)
      .pipe(transport({pkg: pkg, include: 'relative', ignore: ['import-style']}))
      .on('data', function(file) {
        assert(file, 'transport-include-relative-css-ignore.js');
        done();
      });
    });

    it('all', function(done) {
      var pkg = getPackage('js-require-js');

      var opt = {
        cwd: join(base, 'js-require-js'),
        cwdbase: true
      };

      gulp.src(pkg.main, opt)
      .pipe(transport({pkg: pkg, include: 'all'}))
      .on('data', function(file) {
        assert(file, 'transport-include-all.js');
        done();
      });
    });

    it('all with ignore', function(done) {
      var pkg = getPackage('js-require-js');

      var opt = {
        cwd: join(base, 'js-require-js'),
        cwdbase: true
      };

      gulp.src(pkg.main, opt)
      .pipe(transport({pkg: pkg, include: 'all', ignore: ['b']}))
      .on('data', function(file) {
        assert(file, 'transport-include-all-ignore.js');
        done();
      });
    });

    it('all with ignore2', function(done) {
      var pkg = getPackage('js-require-js');

      var opt = {
        cwd: join(base, 'js-require-js'),
        cwdbase: true
      };

      gulp.src(pkg.main, opt)
      .pipe(transport({pkg: pkg, include: 'all', ignore: ['c']}))
      .on('data', function(file) {
        assert(file, 'transport-include-all-ignore2.js');
        done();
      });
    });

    it('all with css', function(done) {
      var pkg = getPackage('js-require-css');

      var opt = {
        cwd: join(base, 'js-require-css'),
        cwdbase: true
      };

      gulp.src(pkg.main, opt)
      .pipe(transport({pkg: pkg, include: 'all'}))
      .on('data', function(file) {
        assert(file, 'transport-include-all-css.js');
        done();
      });
    });

  });

  describe('rename', function() {

    it('rename with debug', function(done) {
      var pkg = getPackage('type-transport');

      var opt = {
        cwd: join(base, 'type-transport'),
        cwdbase: true
      };

      gulp.src(pkg.main, opt)
      .pipe(transport({pkg: pkg, rename: {suffix: '-debug'}}))
      .on('data', function(file) {
        util.winPath(file.originPath).should.include('type-transport/index.js');
        util.winPath(file.path).should.include('type-transport/index-debug.js');
        assert(file, 'transport-rename-debug.js');
        done();
      });
    });

    it('rename with hash', function(done) {
      var pkg = getPackage('transport-hash');

      var opt = {
        cwd: join(base, 'transport-hash'),
        cwdbase: true
      };

      function rename(file) {
        var hash = utility.sha1(fs.readFileSync(file.origin)).substring(0,8);
        file.basename += '-' + hash;
        return file;
      }

      gulp.src(pkg.main, opt)
      .pipe(transport({pkg: pkg, rename: rename}))
      .on('data', function(file) {
        util.winPath(file.originPath).should.include('transport-hash/index.js');
        util.winPath(file.path).should.include('transport-hash/index-8951f677.js');
        assert(file, 'transport-rename-hash.js');
        done();
      });
    });

    it('rename with css', function(done) {
      var pkg = getPackage('css-import');

      var opt = {
        cwd: join(base, 'css-import'),
        cwdbase: true
      };

      gulp.src('index.css', opt)
      .pipe(transport({pkg: pkg, rename: {suffix: '-debug'}}))
      .on('data', function(file) {
        util.winPath(file.originPath).should.include('css-import/index.css');
        util.winPath(file.path).should.include('css-import/index-debug.css');
        assert(file, 'transport-rename-css.css');
        done();
      });
    });
  });

  xit('no handlebars deps', function(done) {
    var pkg = getPackage('no-handlebars');
    var opt = {
      cwd: join(base, 'no-handlebars'),
      cwdbase: true
    };

    gulp.src(pkg.main, opt)
    .pipe(transport({pkg: pkg, include: 'self'}))
    .once('error', function(e) {
      e.message.should.eql('handlebars-runtime not exist, but required .handlebars');

    })
    .on('end', done);
  });

  describe('other extension', function() {

    it('relative', function(done) {
      var pkg = getPackage('require-other-ext');
      var opt = {
        cwd: join(base, 'require-other-ext'),
        cwdbase: true
      };

      gulp.src(pkg.main, opt)
      .pipe(transport({pkg: pkg}))
      .on('data', function(file) {
        assert(file, 'transport-other-ext.js');
        done();
      });
    });

    it('debug', function(done) {
      var pkg = getPackage('require-other-ext');
      var opt = {
        cwd: join(base, 'require-other-ext'),
        cwdbase: true
      };

      gulp.src(pkg.main, opt)
      .pipe(transport({pkg: pkg, rename: {suffix: '-debug'}}))
      .on('data', function(file) {
        assert(file, 'transport-other-ext-debug.js');
        done();
      });
    });
  });

  describe('custom stream', function() {

    it('js stream', function(done) {
      var pkg = getPackage('js-require-js');

      var gulpOpt = {
        cwd: join(base, 'js-require-js'),
        cwdbase: true
      };

      var isCalled = false, args;
      var stream = {
        '.js': function(opt) {
          isCalled = true;
          args = opt;
          return plugin.js({
            pkg: pkg
          });
        }
      };
      var opt = {
        pkg: pkg,
        idleading: '',
        stream: stream
      };

      gulp.src(pkg.main, gulpOpt)
      .pipe(transport(opt))
      .on('data', function(file) {
        assert(file, 'transport-include-relative.js');
        isCalled.should.be.true;
        args.ignore.should.equal('');
        args.include.should.equal('');
        args.pkg.should.equal(pkg);
        args.idleading.should.equal('');
        args.stream.should.equal(stream);
        done();
      });
    });

    it('should throw when opt.stream is not function', function() {
      var pkg = getPackage('js-require-js');
      var opt = {
        pkg: pkg,
        stream: {
          '.js': plugin.js({pkg: pkg})
        }
      };
      (function() {
        transport(opt);
      }).should.throw('opt.stream\'s value should be function');
    });
  });

  it('require directory', function(done) {
    var pkg = getPackage('require-directory');
    var opt = {
      cwd: join(base, 'require-directory'),
      cwdbase: true
    };

    gulp.src(pkg.main, opt)
    .pipe(transport({pkg: pkg, include: 'self'}))
    .on('data', function(file) {
      assert(file, 'require-directory.js');
      done();
    });
  });

  describe('exports', function() {
    var exports = require('..');

    it('transport', function() {
      exports.should.equal(transport);
    });

    it('plugin.js', function() {
      exports.plugin.js.should.equal(require('../lib/plugin/js'));
    });

    it('plugin.css', function() {
      exports.plugin.css.should.equal(require('../lib/plugin/css'));
    });

    it('plugin.css2js', function() {
      exports.plugin.css2js.should.equal(require('../lib/plugin/css2js'));
    });

    it('plugin.handlebars', function() {
      exports.plugin.handlebars.should.equal(require('../lib/plugin/handlebars'));
    });

    it('plugin.tpl', function() {
      exports.plugin.tpl.should.equal(require('../lib/plugin/tpl'));
    });

    it('plugin.json', function() {
      exports.plugin.json.should.equal(require('../lib/plugin/json'));
    });

    it('plugin.include', function() {
      exports.plugin.include.should.equal(require('../lib/plugin/include'));
    });

    it('plugin.concat', function() {
      exports.plugin.concat.should.equal(require('../lib/plugin/concat'));
    });

    it('plugin.dest', function() {
      exports.plugin.dest.should.equal(require('../lib/plugin/dest'));
    });

    it('common', function() {
      exports.common.should.equal(require('../lib/common'));
    });

    it('util', function() {
      exports.util.should.equal(require('../lib/util'));
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
