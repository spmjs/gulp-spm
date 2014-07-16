define("a/1.0.0/src/index", ["c"], function(require, exports, module){
require("b/1.0.0/index");
require("a/1.0.0/a");

});
define("b/1.0.0/index", ["c"], function(require, exports, module){
require('c');
require("b/1.0.0/b");

});
define("b/1.0.0/b", [], function(require, exports, module){
console.log('b');

});
define("a/1.0.0/a", [], function(require, exports, module){
console.log('a');

});
