define("a/1.0.0/src/index", ["b/1.0.0/index","c/1.0.0/index"], function(require, exports, module){
require("b/1.0.0/index");
require("a/1.0.0/a");

});
define("a/1.0.0/a", [], function(require, exports, module){
console.log('a');

});
