'use strict';

require('should');
var join = require('path').join;
var base = join(__dirname, 'fixtures');

var jsParser = require('../lib/plugin/js');
var css2jsParser = require('../lib/plugin/css2js');
var jsonParser = require('../lib/plugin/json');
var tplParser = require('../lib/plugin/tpl');
var handlebarsParser = require('../lib/plugin/handlebars');
var cssParser = require('../lib/plugin/css');
var include = require('../lib/plugin/include');
var createFile = require('./support/file');
var assert = require('./support/assertFile');
var getPackage = require('./support/getPackage');

describe('Plugin', function() {

  describe('js', function() {

    var pkg = getPackage('simple-transport', {entry: ['c.js']});

    it('transport js', function(done) {
      var fakeFile = createFile(base, 'simple-transport/c.js');

      var stream = jsParser({pkg: pkg, include: 'self'})
      .on('data', function(file) {
        assert(file, 'plugin-js.js');
      })
      .on('end', done);
      stream.write(fakeFile);
      stream.end();
    });

    it('transport js ignore', function(done) {
      var fakeFile = createFile(base, 'simple-transport/c.js');

      var stream = jsParser({
        pkg: pkg,
        ignore: ['b'],
        idleading: '{{name}}-{{version}}',
        include: 'self'
      })
      .on('data', function(file) {
        assert(file, 'plugin-js-ignore.js');
      })
      .on('end', done);
      stream.write(fakeFile);
      stream.end();
    });

    it('transport js with type', function(done) {
      var pkg = getPackage('type-transport');
      var fakeFile = createFile(base, 'type-transport/index.js');

      var stream = jsParser({pkg: pkg, include: 'self'})
      .on('data', function(file) {
        assert(file, 'plugin-js-type.js');
      })
      .on('end', done);
      stream.write(fakeFile);
      stream.end();
    });

    it('transport js deep', function(done) {
      var fakeFile = createFile(base, 'simple-transport/sea-modules/b/1.1.0/src/b.js');

      var stream = jsParser({pkg: pkg, include: 'self'})
      .on('data', function(file) {
        assert(file, 'plugin-js-deep.js');
      })
      .on('end', done);
      stream.write(fakeFile);
      stream.end();
    });

    it('transport js stylebox', function(done) {
      var pkg = getPackage('type-transport', {
        entry: ['stylebox.js']
      });
      var fakeFile = createFile(base, 'type-transport/stylebox.js');

      var stream = jsParser({pkg: pkg, styleBox: true, include: 'self'})
      .on('data', function(file) {
        assert(file, 'plugin-js-stylebox.js');
      })
      .on('end', done);

      stream.write(fakeFile);
      stream.end();
    });
  });

  describe('css2js', function() {

    var pkg = getPackage('type-transport', {
      entry: ['stylebox.js']
    });

    it('transport css2js', function(done) {
      var fakeCss = createFile(base, 'type-transport/a.css');

      var stream = css2jsParser({pkg: pkg})
      .on('data', function(file) {
        file.originPath.should.endWith('.css');
        file.path.should.endWith('.css.js');
        assert(file, 'plugin-css2js.js');
      })
      .on('end', done);
      stream.write(fakeCss);
      stream.end();
    });

    it('transport css2js with styleBox', function(done) {
      var fakeCss = createFile(base, 'type-transport/stylebox.css');

      var stream = css2jsParser({pkg: pkg, styleBox: true})
      .on('data', function(file) {
        file.originPath.should.endWith('.css');
        file.path.should.endWith('.css.js');
        assert(file, 'plugin-css2js-stylebox.js');
      })
      .on('end', done);
      stream.write(fakeCss);
      stream.end();
    });
  });

  describe('json', function() {

    it('transport json', function(done) {
      var pkg = getPackage('type-transport');
      var fakeFile = createFile(base, 'type-transport/a.json');

      var stream = jsonParser({pkg: pkg});
      stream
      .on('data', function(file) {
        file.originPath.should.endWith('.json');
        file.path.should.endWith('.json.js');
        assert(file, 'plugin-json.js');
      })
      .on('end', done);
      stream.write(fakeFile);
      stream.end();
    });
  });

  describe('tpl', function() {

    it('transport tpl', function(done) {
      var pkg = getPackage('type-transport');
      var fakeFile = createFile(base, 'type-transport/a.tpl');

      var stream = tplParser({pkg: pkg});
      stream
      .on('data', function(file) {
        file.path.should.endWith('.tpl.js');
        assert(file, 'plugin-tpl.js');
      })
      .on('end', done);
      stream.write(fakeFile);
      stream.end();
    });
  });

  describe('handlebars', function() {

    it('transport handlebars', function(done) {
      var pkg = getPackage('type-transport');
      var fakeFile = createFile(base, 'type-transport/a.handlebars');

      var stream = handlebarsParser({pkg: pkg})
      .on('data', function(file) {
        file.originPath.should.endWith('.handlebars');
        file.path.should.endWith('.handlebars.js');
        assert(file, 'plugin-handlebars.js');
      })
      .on('end', done);
      stream.write(fakeFile);
      stream.end();
    });

    it('transport handlebars not match', function(done) {
      var pkg = getPackage('handlebars-not-match');
      var fakeFile = createFile(base, 'handlebars-not-match/a.handlebars');

      var stream = handlebarsParser({pkg: pkg})
      .on('error', function(e) {
        e.plugin.should.eql('transport:handlebars');
        e.message.should.eql('handlebars version should be 1.3.0 but 1.2.0');
        done();
      });
      stream.write(fakeFile);
      stream.end();
    });

    it('no handlebars deps', function(done) {
      var pkg = getPackage('no-handlebars');
      var fakeFile = createFile(base, 'no-handlebars/a.handlebars');

      var stream = handlebarsParser({pkg: pkg})
      .on('data', function(file) {
        assert(file, 'plugin-handlebars.js');
      })
      .on('end', done);
      stream.write(fakeFile);
      stream.end();
    });

  });

  describe('css', function() {

    var pkg = getPackage('css-import');

    it('transport css import', function(done) {
      var fakeFile = createFile(pkg.dest, pkg.main);

      var stream = cssParser({pkg: pkg})
      .on('data', function(file) {
        file.path.should.endWith('.css');
        assert(file, 'plugin-css.css');
      })
      .on('end', done);

      stream.write(fakeFile);
      stream.end();
    });

    it('transport css import ignore', function(done) {
      var fakeFile = createFile(pkg.dest, pkg.main);

      var stream = cssParser({pkg: pkg, ignore: ['b']})
      .on('data', function(file) {
        assert(file, 'plugin-css-ignore.css');
      })
      .on('end', done);

      stream.write(fakeFile);
      stream.end();
    });

    it('transport css import error', function(done) {
      var fakeFile = createFile(pkg.dest, 'a5.css');

      var stream = cssParser({pkg: pkg})
      .on('error', function(e) {
        e.message.should.eql('package c not exists');
        e.plugin.should.eql('transport:css');
        done();
      });

      stream.write(fakeFile);
      stream.end();
    });

    it('transport css conflict', function(done) {
      var pkg = getPackage('css-conflict');
      var fakeFile = createFile(pkg.dest, pkg.main);

      var stream = cssParser({pkg: pkg})
      .on('error', function(e) {
        e.plugin.should.eql('transport:css');
        e.message.should.eql('c@1.0.0 conflict with c@1.0.1');
        done();
      });
      stream.write(fakeFile);
      stream.end();
    });
  });

  xdescribe('include', function() {
    var pkg = getPackage('css-conflict');

    it('self', function(done) {
      var fakeFile = createFile(pkg.dest, pkg.main);

      var ret = [];
      var stream = include({pkg: pkg, include: 'self'})
      .on('data', function(file) {
        ret.push(file);
      })
      .on('end', function() {
        done();
      });
      stream.write(fakeFile);
      stream.end();
    });
  });

});
