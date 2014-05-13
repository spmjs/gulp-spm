# gulp-transport [![Build Status](https://travis-ci.org/popomore/gulp-transport.png?branch=master)](https://travis-ci.org/popomore/gulp-transport) [![Coverage Status](https://coveralls.io/repos/popomore/gulp-transport/badge.png?branch=master)](https://coveralls.io/r/popomore/gulp-transport?branch=master)

gulp plugin for cmd transport

---

## Install

```
$ npm install gulp-transport -g
```

## Usage

Transport will use pkg parsed by [father](https://github.com/popomore/father)

```
var Package = require('father').SpmPackage;
var transport = require('gulp-transport');
var pkg = new Package('path/to/module');
gulp.src(pkg.main)
  .pipe(transport({pkg: pkg}))
  .pipe(gulp.dest('path/to/dest'));
```

See [example](https://github.com/popomore/gulp-transport/blob/master/test/parser.test.js)

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
