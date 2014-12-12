define("b/1.0.0/index", ["camel-case/1.0.0/index","import-style/1.0.0/index"], function(require, exports, module){
require("camel-case/1.0.0/index");
require("b/1.0.0/b");

});
define("b/1.0.0/b", [], function(require, exports, module){
console.log('b');

});
