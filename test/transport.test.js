'use strict';

require('should');
var fs = require('fs');
var join = require('path').join;
var vfs = require('vinyl-fs');
var fixtures = join(__dirname, 'fixtures');
var transport = require('../lib/transport');
var plugin = require('../lib/plugin');
var util = require('../lib/util');
var Package = require('father').SpmPackage;

describe('Transport', function() {

  it('transport all', function(done) {
    var cwd = join(fixtures, 'simple-transport');
    var opt = {
      cwd: cwd,
      moduleDir: 'sea-modules',
      include: 'all',
      ignore: 'b',
      skip: []
    };

    vfs.src('index.js', {cwd: cwd, cwdbase: true})
    .pipe(transport(opt))
    .on('data', function(file) {
      util.winPath(file.path).should.endWith('simple-transport/simple-transport/1.0.0/index.js');
      assert(file, 'transport-all.js');
      done();
    });
  });

  it('transport all using father', function(done) {
    var cwd = join(fixtures, 'simple-transport');
    var pkg = new Package(cwd, {
      moduleDir: 'sea-modules',
      ignore: ['b']
    });
    var opt = {
      pkg: pkg,
      include: 'all'
    };

    vfs.src('index.js', {cwd: cwd, cwdbase: true})
    .pipe(transport(opt))
    .on('data', function(file) {
      util.winPath(file.path).should.endWith('simple-transport/simple-transport/1.0.0/index.js');
      assert(file, 'transport-all.js');
      done();
    });
  });

  it('transport all with global', function(done) {
    var cwd = join(fixtures, 'global');
    var opt = {
      cwd: cwd,
      moduleDir: 'sea-modules',
      include: 'all',
      global: {
        jquery: 'window.jQuery',
        react: 'React'
      }
    };

    vfs.src('index.js', {cwd: cwd, cwdbase: true})
      .pipe(transport(opt))
      .on('data', function(file) {
        file.contents = new Buffer(file.contents + '\n');
        assert(file, 'transport-all-global.js');
        done();
      });
  });

  // https://github.com/spmjs/gulp-spm/issues/5
  describe('include', function() {

    it('self', function(done) {
      var cwd = join(fixtures, 'js-require-js');
      var opt = {
        cwd: cwd,
        moduleDir: 'sea-modules',
        include: 'self'
      };

      vfs.src('src/index.js', {cwd: cwd, cwdbase: true})
      .pipe(transport(opt))
      .on('data', function(file) {
        assert(file, 'transport-include-self.js');
        done();
      });
    });

    it('self with ignore', function(done) {
      var cwd = join(fixtures, 'js-require-js');
      var opt = {
        cwd: cwd,
        moduleDir: 'sea-modules',
        include: 'self',
        ignore: ['b']
      };

      vfs.src('src/index.js', {cwd: cwd, cwdbase: true})
      .pipe(transport(opt))
      .on('data', function(file) {
        assert(file, 'transport-include-self-ignore.js');
        done();
      });
    });

    it('self with css', function(done) {
      var cwd = join(fixtures, 'js-require-css');
      var opt = {
        cwd: cwd,
        moduleDir: 'sea-modules',
        include: 'self'
      };

      vfs.src('index.js', {cwd: cwd, cwdbase: true})
      .pipe(transport(opt))
      .on('data', function(file) {
        assert(file, 'transport-include-self-css.js');
        done();
      });
    });

    it('relative', function(done) {
      var cwd = join(fixtures, 'js-require-js');
      var opt = {
        cwd: cwd,
        moduleDir: 'sea-modules',
        include: 'relative'
      };

      vfs.src('src/index.js', {cwd: cwd, cwdbase: true})
      .pipe(transport(opt))
      .on('data', function(file) {
        assert(file, 'transport-include-relative.js');
        done();
      });
    });


    it('relative with ignore', function(done) {
      var cwd = join(fixtures, 'js-require-js');
      var opt = {
        cwd: cwd,
        moduleDir: 'sea-modules',
        include: 'relative',
        ignore: ['b']
      };

      vfs.src('src/index.js', {cwd: cwd, cwdbase: true})
      .pipe(transport(opt))
      .on('data', function(file) {
        assert(file, 'transport-include-relative-ignore.js');
        done();
      });
    });

    it('relative with css', function(done) {
      var cwd = join(fixtures, 'js-require-css');
      var opt = {
        cwd: cwd,
        moduleDir: 'sea-modules',
        include: 'relative'
      };

      vfs.src('index.js', {cwd: cwd, cwdbase: true})
      .pipe(transport(opt))
      .on('data', function(file) {
        assert(file, 'transport-include-relative-css.js');
        done();
      });
    });

    it('relative with css ignore', function(done) {
      var cwd = join(fixtures, 'js-require-css');
      var opt = {
        cwd: cwd,
        moduleDir: 'sea-modules',
        include: 'relative',
        ignore: ['import-style']
      };

      vfs.src('index.js', {cwd: cwd, cwdbase: true})
      .pipe(transport(opt))
      .on('data', function(file) {
        assert(file, 'transport-include-relative-css-ignore.js');
        done();
      });
    });

    it('all', function(done) {
      var cwd = join(fixtures, 'js-require-js');
      var opt = {
        cwd: cwd,
        moduleDir: 'sea-modules',
        include: 'all'
      };

      vfs.src('src/index.js', {cwd: cwd, cwdbase: true})
      .pipe(transport(opt))
      .on('data', function(file) {
        assert(file, 'transport-include-all.js');
        done();
      });
    });

    it('all with ignore', function(done) {
      var cwd = join(fixtures, 'js-require-js');
      var opt = {
        cwd: cwd,
        moduleDir: 'sea-modules',
        include: 'all',
        ignore: ['b']
      };

      vfs.src('src/index.js', {cwd: cwd, cwdbase: true})
      .pipe(transport(opt))
      .on('data', function(file) {
        assert(file, 'transport-include-all-ignore.js');
        done();
      });
    });

    it('all with ignore2', function(done) {
      var cwd = join(fixtures, 'js-require-js');
      var opt = {
        cwd: cwd,
        moduleDir: 'sea-modules',
        include: 'all',
        ignore: ['camel-case']
      };

      vfs.src('src/index.js', {cwd: cwd, cwdbase: true})
      .pipe(transport(opt))
      .on('data', function(file) {
        assert(file, 'transport-include-all-ignore2.js');
        done();
      });
    });

    it('all with ignore package', function(done) {
      var cwd = join(fixtures, 'ignore-package');
      var opt = {
        cwd: cwd,
        moduleDir: 'sea-modules',
        include: 'all',
        ignore: ['jquery']
      };

      vfs.src('index.js', {cwd: cwd, cwdbase: true})
      .pipe(transport(opt))
      .on('data', function(file) {
        assert(file, 'transport-include-all-ignore-package.js');
        done();
      });
    });

    it('all with css', function(done) {
      var cwd = join(fixtures, 'js-require-css');
      var opt = {
        cwd: cwd,
        moduleDir: 'sea-modules',
        include: 'all'
      };

      vfs.src('index.js', {cwd: cwd, cwdbase: true})
      .pipe(transport(opt))
      .on('data', function(file) {
        assert(file, 'transport-include-all-css.js');
        done();
      });
    });
  });

  describe('rename', function() {

    it('rename with debug', function(done) {
      var cwd = join(fixtures, 'type-transport');
      var opt = {
        cwd: cwd,
        moduleDir: 'sea-modules',
        rename: {debug:true}
      };

      vfs.src('index.js', {cwd: cwd, cwdbase: true})
      .pipe(transport(opt))
      .on('data', function(file) {
        util.winPath(file.history[0]).should.containEql('type-transport/index.js');
        util.winPath(file.path).should.containEql('type-transport/type-transport/1.0.0/index-debug.js');
        assert(file, 'transport-rename-debug.js');
        done();
      });
    });

    it('rename with hash', function(done) {
      var cwd = join(fixtures, 'transport-hash');
      var opt = {
        cwd: cwd,
        moduleDir: 'sea-modules',
        rename: {hash:true}
      };

      vfs.src('index.js', {cwd: cwd, cwdbase: true})
      .pipe(transport(opt))
      .on('data', function(file) {
        util.winPath(file.history[0]).should.containEql('transport-hash/index.js');
        util.winPath(file.path).should.containEql('transport-hash/a/1.0.0/index-3a9e238e.js');
        assert(file, 'transport-rename-hash.js');
        done();
      });
    });

    it('rename with hash and debug', function(done) {
      var cwd = join(fixtures, 'transport-hash');
      var opt = {
        cwd: cwd,
        moduleDir: 'sea-modules',
        rename: {hash:true,debug:true}
      };

      vfs.src('index.js', {cwd: cwd, cwdbase: true})
        .pipe(transport(opt))
        .on('data', function(file) {
          util.winPath(file.history[0]).should.containEql('transport-hash/index.js');
          util.winPath(file.path).should.containEql('transport-hash/a/1.0.0/index-3a9e238e-debug.js');
          assert(file, 'transport-rename-hash-debug.js');
          done();
        });
    });

    it('rename with css', function(done) {
      var cwd = join(fixtures, 'css-import');
      var opt = {
        cwd: cwd,
        moduleDir: 'sea-modules',
        rename: {debug: true}
      };

      vfs.src('index.css', {cwd: cwd, cwdbase: true})
      .pipe(transport(opt))
      .on('data', function(file) {
        util.winPath(file.history[0]).should.containEql('css-import/index.css');
        util.winPath(file.path).should.containEql('css-import/a/1.0.0/index-debug.css');
        assert(file, 'transport-rename-css.css');
        done();
      });
    });

    it('rename dependency with debug', function(done) {
      var cwd = join(fixtures, 'type-transport');
      var opt = {
        cwd: cwd,
        moduleDir: 'sea-modules',
        rename: {debug: true}
      };

      var ret = [], src = [
        'index.js',
        'sea-modules/handlebars-runtime/1.3.0/handlebars.js'
      ];
      vfs.src(src, {cwd: cwd, cwdbase: true})
      .pipe(transport(opt))
      .on('data', function(file) {
        ret.push(file);
      })
      .on('end', function() {
        util.winPath(ret[0].path).should.endWith('type-transport/type-transport/1.0.0/index-debug.js');
        util.winPath(ret[0].base).should.endWith('type-transport');
        assert(ret[0], 'transport-rename-debug.js');

        util.winPath(ret[1].path).should.endWith('type-transport/sea-modules/handlebars-runtime/1.3.0/handlebars-runtime/1.3.0/handlebars-debug.js');
        util.winPath(ret[1].base).should.endWith('type-transport/sea-modules/handlebars-runtime/1.3.0');
        assert(ret[1], 'transport-rename-debug-handelbars.js');
        done();
      });
    });
  });

  xit('no handlebars deps', function(done) {
    var cwd = join(fixtures, 'no-handlebars');
    var opt = {
      cwd: cwd,
      moduleDir: 'sea-modules',
      include: 'self'
    };

    vfs.src('index.js', {cwd: cwd, cwdbase: true})
    .pipe(transport(opt))
    .once('error', function(e) {
      e.message.should.eql('handlebars-runtime not exist, but required .handlebars');

    })
    .on('end', done);
  });

  describe('other extension', function() {

    it('relative', function(done) {
      var cwd = join(fixtures, 'require-other-ext');
      var opt = {
        cwd: cwd,
        moduleDir: 'sea-modules'
      };

      vfs.src('index.js', {cwd: cwd, cwdbase: true})
      .pipe(transport(opt))
      .on('data', function(file) {
        assert(file, 'transport-other-ext.js');
        done();
      });
    });

    it('debug', function(done) {
      var cwd = join(fixtures, 'require-other-ext');
      var opt = {
        cwd: cwd,
        moduleDir: 'sea-modules',
        rename: {debug: true}
      };

      vfs.src('index.js', {cwd: cwd, cwdbase: true})
      .pipe(transport(opt))
      .on('data', function(file) {
        assert(file, 'transport-other-ext-debug.js');
        done();
      });
    });
  });

  describe('custom stream', function() {

    it('js stream', function(done) {
      var cwd = join(fixtures, 'js-require-js');
      var isCalled = false, args;
      var stream = {
        '.js': function(opt) {
          isCalled = true;
          args = opt;
          return plugin.js({
            cwd: cwd,
            pkg: opt.pkg
          });
        }
      };
      var opt = {
        cwd: cwd,
        moduleDir: 'sea-modules',
        idleading: '',
        stream: stream
      };

      vfs.src('src/index.js', {cwd: cwd, cwdbase: true})
      .pipe(transport(opt))
      .on('data', function(file) {
        assert(file, 'transport-include-relative.js');
        isCalled.should.be.true;
        args.ignore.should.eql([]);
        args.include.should.equal('relative');
        //args.pkg.should.equal(pkg);
        args.idleading.should.equal('');
        args.stream.should.equal(stream);
        done();
      });
    });

    it('should throw when opt.stream is not function', function() {
      var cwd = join(fixtures, 'js-require-js');
      var opt = {
        cwd: cwd,
        moduleDir: 'sea-modules',
        stream: {
          '.js': plugin.js({base: cwd, pkg: {}})
        }
      };
      (function() {
        transport(opt);
      }).should.throw('opt.stream\'s value should be function');
    });
  });

  it('require directory', function(done) {
    var cwd = join(fixtures, 'require-directory');
    var opt = {
      cwd: cwd,
      moduleDir: 'sea-modules',
      include: 'self'
    };

    vfs.src('index.js', {cwd: cwd, cwdbase: true})
    .pipe(transport(opt))
    .on('data', function(file) {
      assert(file, 'require-directory.js');
      done();
    });
  });

  it('transport dependency', function(done) {
    var cwd = join(fixtures, 'js-require-js');
    var opt = {
      cwd: cwd,
      moduleDir: 'sea-modules',
      include: 'relative'
    };

    var ret = [], src = [
      'src/index.js',
      'sea-modules/b/1.0.0/index.js',
      'sea-modules/camel-case/1.0.0/index.js'
    ];
    vfs.src(src, {cwd: cwd, cwdbase: true})
    .pipe(transport(opt))
    .on('data', function(file) {
      ret.push(file);
    })
    .on('end', function() {
      util.winPath(ret[0].path).should.endWith('js-require-js/my-package/1.0.0/src/index.js');
      util.winPath(ret[0].base).should.endWith('js-require-js');
      assert(ret[0], 'transport-include-relative.js');

      util.winPath(ret[1].path).should.endWith('js-require-js/sea-modules/b/1.0.0/b/1.0.0/index.js');
      util.winPath(ret[1].base).should.endWith('js-require-js/sea-modules/b/1.0.0');
      assert(ret[1], 'transport-include-relative-b.js');

      util.winPath(ret[2].path).should.endWith('js-require-js/sea-modules/camel-case/1.0.0/camel-case/1.0.0/index.js');
      util.winPath(ret[2].base).should.endWith('js-require-js/sea-modules/camel-case/1.0.0');
      assert(ret[2], 'transport-include-relative-camel-case.js');
      done();
    });
  });

  it('skip package', function(done) {
    var cwd = join(fixtures, 'ignore-package');
    var opt = {
      cwd: cwd,
      moduleDir: 'sea-modules',
      include: 'relative',
      skip: 'jquery'
    };

    vfs.src('index.js', {cwd: cwd, cwdbase: true})
    .pipe(transport(opt))
    .on('data', function(file) {
      assert(file, 'transport-skip.js');
      done();
    });
  });

  it('transport css resources', function(done) {
    var ret = [], cwd = join(fixtures, 'css-resources');
    var opt = {
      cwd: cwd,
      moduleDir: 'spm_modules'
    };

    vfs.src(['a.css'], {cwd:cwd, cwdbase:true})
      .pipe(transport(opt))
      .on('data', function(file) {
        ret.push(file);
      })
      .on('end', function() {
        ret.should.have.length(3);
        ret[0].path.should.endWith('css-resources/a/0.1.0/a.jpg');
        ret[1].path.should.endWith('css-resources/a/0.1.0/b_0_2_0_a.jpg');
        ret[2].path.should.endWith('css-resources/a/0.1.0/a.css');
        assert(ret[2], 'css-resources-a.css');
        done();
      });
  });

  it('transport css resources (not root)', function(done) {
    var ret = [], cwd = join(fixtures, 'css-resources-not-root');
    var opt = {
      cwd: cwd,
      moduleDir: 'spm_modules'
    };

    vfs.src(['css/a.css'], {cwd:cwd, cwdbase:true})
      .pipe(transport(opt))
      .on('data', function(file) {
        ret.push(file);
      })
      .on('end', function() {
        ret.should.have.length(3);
        ret[0].path.should.endWith('css-resources-not-root/a/0.1.0/a.jpg');
        ret[1].path.should.endWith('css-resources-not-root/a/0.1.0/b_0_2_0_a.jpg');
        ret[2].path.should.endWith('css-resources-not-root/a/0.1.0/css/a.css');
        assert(ret[2], 'css-resources-not-root-a.css');
        done();
      });
  });

  it('transport other type', function(done) {
    var ret = [], cwd = join(fixtures, 'type-transport');
    var opt = {
      cwd: cwd,
      moduleDir: 'sea-modules'
    };

    var files = [
      'a.jpg',
      'a.html',
      'a.json',
      'a.tpl',
      'a.handlebars'
    ];
    vfs.src(files, {cwd: cwd, cwdbase: true})
    .pipe(transport(opt))
    .on('data', function(file) {
      ret.push(file);
    })
    .on('end', function() {
      ret.should.have.length(5);
      ret[0].path.should.endWith('type-transport/type-transport/1.0.0/a.jpg');
      ret[1].path.should.endWith('type-transport/type-transport/1.0.0/a.html');
      assert(ret[1], 'transport-other-type.html');
      ret[2].path.should.endWith('type-transport/type-transport/1.0.0/a.json.js');
      assert(ret[2], 'transport-other-type-json.js');
      ret[3].path.should.endWith('type-transport/type-transport/1.0.0/a.tpl.js');
      assert(ret[3], 'transport-other-type-tpl.js');
      ret[4].path.should.endWith('type-transport/type-transport/1.0.0/a.handlebars.js');
      assert(ret[4], 'transport-other-type-handlebars.js');
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
      exports.plugin.tpl.should.equal(require('../lib/plugin/tpl').tpl);
    });

    it('plugin.html', function() {
      exports.plugin.html.should.equal(require('../lib/plugin/tpl').html);
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

function assert(file, expectedFile) {
  var code = file.contents.toString();
  var expected = readFile(__dirname + '/expected/' + expectedFile);
  code.should.eql(expected);
}

function readFile(path) {
  return fs.readFileSync(path).toString().replace(/\r/g, '');
}
