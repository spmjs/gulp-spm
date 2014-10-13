define("b/1.0.0/index", ["c/1.0.0/index","import-style/1.0.0/index"], function(require, exports, module){
require("c/1.0.0/index");
require("b/1.0.0/b");

});
define("b/1.0.0/b", [], function(require, exports, module){
console.log('b');

});
