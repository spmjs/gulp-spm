# gulp-spm [![Build Status](https://travis-ci.org/popomore/gulp-spm.png?branch=master)](https://travis-ci.org/popomore/gulp-spm) [![Coverage Status](https://coveralls.io/repos/popomore/gulp-spm/badge.png?branch=master)](https://coveralls.io/r/popomore/gulp-spm?branch=master)

gulp plugin for cmd transport

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

### parser

- transport.plugin.tplParser: transport .tpl to .js
- transport.plugin.jsonParser: transport .json to .js
- transport.plugin.css2jsParser: transport .css to .js
- transport.plugin.handlebarsParser: transport .handlebars to .js
- transport.plugin.cssParser: transport .css to .css

## LISENCE

Copyright (c) 2014 popomore. Licensed under the MIT license.
