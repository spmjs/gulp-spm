# gulp-spm

[![NPM version](https://img.shields.io/npm/v/gulp-spm.svg?style=flat)](https://npmjs.org/package/gulp-spm)
[![Build Status](https://img.shields.io/travis/spmjs/gulp-spm.svg?style=flat)](https://travis-ci.org/spmjs/gulp-spm)
[![Coverage Status](https://img.shields.io/coveralls/spmjs/gulp-spm.svg?style=flat)](https://coveralls.io/r/spmjs/gulp-spm)
[![NPM downloads](http://img.shields.io/npm/dm/gulp-spm.svg?style=flat)](https://npmjs.org/package/gulp-spm)

gulp plugin for cmd transport

name has changed after 0.9.x, old version see [gulp-transport](https://www.npmjs.com/package/gulp-transport)

---

## Install

```
$ npm install gulp-spm -g
```

## Usage

Transport will use pkg parsed by [father](https://github.com/popomore/father)

```
var Package = require('father').SpmPackage;
var transport = require('gulp-spm');
var pkg = new Package('path/to/module');
gulp.src(pkg.main)
  .pipe(transport({pkg: pkg}))
  .pipe(gulp.dest('path/to/dest'));
```

See [example](https://github.com/spmjs/gulp-spm/blob/master/test/parser.test.js)

### options

- pkg: package info parsed by father
- idleading: cmd id prefix, support simple template, E.g. `{{name}}/{{version}}`
- ignore: array that ignore to transport
- rename: option in [rename](https://github.com/popomore/rename)

### stream plugin

- transport.plugin.tpl: transport .tpl to .js
- transport.plugin.html: transport .html to .js
- transport.plugin.json: transport .json to .js
- transport.plugin.css2js: transport .css to .js
- transport.plugin.handlebars: transport .handlebars to .js
- transport.plugin.css: transport .css to .css
- transport.plugin.json: transport .json to .js

## LISENCE

Copyright (c) 2014 popomore. Licensed under the MIT license.
