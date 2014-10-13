define("a/1.0.0/src/index", ["b/1.0.0/index","c/1.0.0/index","b/1.0.0/c","import-style/1.0.0/index"], function(require, exports, module){
require("b/1.0.0/index");
require("a/1.0.0/a");

});
define("a/1.0.0/a", ["b/1.0.0/c"], function(require, exports, module){
require("b/1.0.0/c");
console.log('a');

});
