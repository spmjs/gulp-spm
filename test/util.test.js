'use strict';

require('should');
var util = require('../lib/util');

describe('Util', function() {

  it('template', function() {
    util.template().should.eql('');
    util.template('{{a}}/{{b}}', {
      a: 1
    }).should.eql('1/');
  });

  it('extendOption', function() {
    util.extendOption().should.eql({
      ignore: [],
      include: 'relative',
      idleading: '{{name}}/{{version}}',
      pkg: null,
      rename: null
    });

    var orig = {
      pkg: {},
      ignore: null
    };
    util.extendOption(orig).should.eql({
      pkg: {},
      ignore: [],
      include: 'relative',
      idleading: '{{name}}/{{version}}',
      rename: null
    });
    orig.should.eql({
      pkg: {},
      ignore: null
    });
  });

  it('hideExt', function() {
    util.hideExt('a.js').should.eql('a');
    util.hideExt('./a.js').should.eql('./a');
    util.hideExt('./a').should.eql('./a');
    util.hideExt('./a.css').should.eql('./a.css');
  });

  it('addExt', function() {
    util.addExt('a').should.eql('a.js');
    util.addExt('a.js').should.eql('a.js');
    util.addExt('./a.js').should.eql('./a.js');
    util.addExt('./a.css').should.eql('./a.css');
  });

  it('rename', function() {
    util.rename('a.js').should.eql('a.js');
    util.rename('a.js', {
      rename: {suffix: '-debug'}
    }).should.eql('a-debug.js');
    util.rename('a.js', {
      rename: function(file) {
        file.basename += '-debug';
        return file;
      }
    }).should.eql('a-debug.js');
    (function() {
      util.rename('a.js', {rename: rename});
      function rename() {
        throw new Error('not found');
      }
    }).should.throw('a.js not found');
  });

  it('isRelative', function() {
    util.isRelative('./a').should.be.ok;
    util.isRelative('../a').should.be.ok;
    util.isRelative('/a.js').should.not.be.ok;
    util.isRelative('a.js').should.not.be.ok;
  });

  it('resolvePath', function() {
    util.resolvePath('./a.js', 'b.js').should.eql('a.js');
    util.resolvePath('./a', 'b.js').should.eql('a');
    util.resolvePath('../a.js', 'src/b.js').should.eql('a.js');
    util.resolvePath('a.js', 'b/c/d.js').should.eql('a.js');
    util.resolvePath('a.js').should.eql('a.js');
    (function() {
      util.resolvePath('../a.js', 'b.js');
    }).should.throw('../a.js is out of bound');
  });

});
