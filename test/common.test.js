'use strict';

require('should');
var fs = require('fs');
var path = require('path');
var join = require('path').join;
var File = require('vinyl');
var Package = require('father').SpmPackage;

var common = require('../lib/common');
var base = join(__dirname, 'fixtures');

describe('Common', function() {
  var pkg = getPackage('simple-transport');

  describe('transportId', function() {

    it('should throw when file is not father file object', function() {
      (function() {
        common.transportId('./a.js');
      }).should.throw('should pass file object of father when transportId `./a.js`');
    });

    it('transportId', function() {
      var main = pkg.files[pkg.main];
      var opt = {
        idleading: '{{name}}/{{version}}'
      };
      common.transportId(main, opt)
        .should.eql('simple-transport/1.0.0/index');
    });

    it('transportId with suffix', function() {
      var pkg = getPackage('type-transport');
      var opt = {
        rename: {suffix: '-debug'}
      };
      var main = pkg.files[pkg.main];
      common.transportId(main, opt)
        .should.eql('type-transport/1.0.0/index-debug');
    });

    it('transportId with function of idleading ', function() {
      var pkg = getPackage('type-transport');
      var opt = {
        idleading: function(filepath, pkg) {
          var dir = path.extname(filepath) === '.js'? 'js' : 'other';
          return dir + '/' + pkg.name + '/{{version}}';
        }
      };

      var main = pkg.files[pkg.main];
      common.transportId(main, opt)
        .should.eql('js/type-transport/1.0.0/index');
      common.transportId(pkg.files['a.tpl'], opt)
        .should.eql('other/type-transport/1.0.0/a.tpl');
    });

    it('transportId with idleading empty string', function() {
      var pkg = getPackage('type-transport');
      var opt = {
        idleading: ''
      };

      var main = pkg.files[pkg.main];
      common.transportId(main, opt)
        .should.eql('index');
      common.transportId(pkg.files['a.tpl'], opt)
        .should.eql('a.tpl');
    });
  });

  describe('transportDeps', function() {

    it('transportDeps', function() {
      var options = {
        idleading: '{{name}}/{{version}}',
        include: 'self'
      };
      var expected = common.transportDeps('index.js', pkg, options);
      expected.should.eql([
        'simple-transport/1.0.0/relative1',
        'simple-transport/1.0.0/relative2',
        'simple-transport/1.0.0/relative3',
        'd/0.1.1/index',
        'b/1.1.0/src/b',
        'c/1.1.1/index',
        'd/0.1.0/index'
      ]);
    });

    it('transportDeps when ignore', function() {
      var options = {
        ignore: ['d'],
        idleading: '{{name}}/{{version}}',
        include: 'self'
      };
      var expected = common.transportDeps('index.js', pkg, options);
      expected.should.eql([
        'simple-transport/1.0.0/relative1',
        'simple-transport/1.0.0/relative2',
        'simple-transport/1.0.0/relative3',
        'd',
        'b/1.1.0/src/b',
        'c/1.1.1/index'
      ]);
    });

    it('stop parsing dependencies when ignore', function() {
      var pkg = getPackage('deep-deps');
      var options = {
        ignore: ['c'],
        idleading: '{{name}}/{{version}}'
      };
      var expected = common.transportDeps('a.js', pkg, options);
      expected.should.eql([
        'b/1.1.0/src/b',
        'c',
        'd'
      ]);
    });

    it('transportDeps do not contain css\'s dependencies', function() {
      var pkg = getPackage('js-require-css');
      var deps = common.transportDeps('index.js', pkg, {pkg: pkg});
      deps.should.eql(['d/1.0.0/index', 'f/1.0.0/index', 'import-style/1.0.0/index']);
    });


    it('transportDeps do not contain css\'s dependencies deep', function() {
      var pkg = getPackage('js-require-js-require-css');
      var deps = common.transportDeps('index.js', pkg, {pkg: pkg});
      deps.should.eql(['b/1.0.0/index', 'import-style/1.0.0/index']);
    });

    // father will throw now
    it('transportDeps which not exist in pkg.files', function() {
      (function() {
        common.transportDeps('not-exist.js', pkg);
      }).should.throw('not-exist.js is not included in files:index.js,relative1.js,relative2.js,relative3.js');
    });

    it('transportDeps getExtra expection', function() {
      var pkg = getPackage('no-handlebars');
      (function() {
        common.transportDeps('index.js', pkg, {pkg: pkg});
      }).should.throw('handlebars-runtime not exist, but required .handlebars');
    });

    xit('transportDeps skip', function() {
      var deps = common.transportDeps('index.js', pkg, {skip: ['c']});
      deps.should.eql([
        'simple-transport/1.0.0/relative1',
        'simple-transport/1.0.0/relative2',
        'simple-transport/1.0.0/relative3',
        'b/1.1.0/src/b',
        'd/0.1.1/index'
      ]);
    });

    xit('transportDeps throw when package is not found', function() {});

    xit('transportDeps throw when file is not found', function() {});

  });

  describe('getFile', function() {

    it('getFile', function() {
      var fakePath = join(base, 'simple-transport/sea-modules/b/1.1.0/src/b.js');
      var fakeFile = new File({
        contents: '',
        path: fakePath
      });

      var fileInfo = common.getFile(fakeFile, pkg);
      fileInfo.path.should.eql('src/b.js');
      fileInfo.pkg.id.should.eql('b@1.1.0');
    });

    it('getFile with string', function() {
      var fakePath = join(base, 'simple-transport/sea-modules/b/1.1.0/src/b.js');
      var fileInfo = common.getFile(fakePath, pkg);
      fileInfo.path.should.eql('src/b.js');
      fileInfo.pkg.id.should.eql('b@1.1.0');
    });

    it('getFile deep directory', function() {
      var pkg = getPackage('require-directory');
      var fakePath = join(base, 'require-directory/lib/index.js');
      var fakeFile = new File({
        contents: '',
        path: fakePath
      });

      var fileInfo = common.getFile(fakeFile, pkg);
      fileInfo.path.should.eql('lib/index.js');
      fileInfo.pkg.id.should.eql('a@1.0.0');
    });

    it('getFile when change file', function() {
      var fakePath = join(base, 'simple-transport/sea-modules/b/1.1.0/src/b.coffee');
      var fakeFile = new File({
        contents: '',
        path: fakePath
      });
      fakeFile.path = join(base, 'simple-transport/sea-modules/b/1.1.0/src/b.js');
      fakeFile.path = join(base, 'simple-transport/sea-modules/b/1.1.0/src/b-debug.js');

      var fileInfo = common.getFile(fakeFile, pkg);
      fileInfo.path.should.eql('src/b.js');
      fileInfo.pkg.id.should.eql('b@1.1.0');
    });

    it('getFile not found', function() {
      var pkg = getPackage('js-require-css');
      var fakePath = join(base, 'js-require-css/sea-modules/b/1.0.1/index.css');
      var fakeFile = new File({
        contents: '',
        path: fakePath
      });
      (function() {
        common.getFile(fakeFile, pkg);
      }).should.throw('not found sea-modules/b/1.0.1/index.css of pkg a@1.0.0');
      (function() {
        common.getFile(fakePath, pkg);
      }).should.throw('not found sea-modules/b/1.0.1/index.css of pkg a@1.0.0');
    });
  });


  describe('createStream', function() {

    it('createStream', function(done) {
      var stream = common.createStream({pkg: pkg}, 'js', parser);
      var fakePath = join(base, 'simple-transport/index.js');
      var fakeFile = new File({
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
      var stream = common.createStream({pkg: pkg}, 'js', function() {throw new Error('error')});
      var fakePath = join(base, 'simple-transport/index.js');
      var fakeFile = new File({
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
        common.createStream({});
      }).should.throw('pkg missing');
    });

    it('createStream do not support stream', function() {
      var stream = common.createStream({pkg: pkg}, 'js', parser);
      var filePath = join(base, 'simple-transport/index.js');
      var fakeFile = new File({
        path: filePath,
        contents: fs.createReadStream(filePath)
      });

      (function() {
        stream.write(fakeFile);
        stream.end();
      }).should.throw('Streaming not supported.');
    });

    it('createStream not supported parser', function() {
      var stream = common.createStream({pkg: pkg}, 'js', parser);
      var fakeFile = new File({
        path: join(base, 'simple-transport/a.no'),
        contents: ''
      });

      (function() {
        stream.write(fakeFile);
        stream.end();
      }).should.throw('extension "no" not supported.');
    });

  });

  it('getStyleId', function() {
    var file = pkg.get('b@1.1.0').files['src/b.js'];

    var opt = {
      idleading: '{{name}}/{{version}}',
      pkg: pkg
    };
    common.getStyleId(file, opt)
      .should.eql('b-1_1_0');

    opt = {
      idleading: function(filepath, pkg) {
        return pkg.name + '/' + path.extname(filepath) + '/';
      },
      pkg: pkg
    };
    common.getStyleId(file, opt)
      .should.eql('b-_js');
  });


});

function getPackage(name, options) {
  var dir = join(base, name);
  return new Package(dir, options);
}

function parser(file) {
  return file;
}
