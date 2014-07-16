define("a/1.0.0/src/index", [], function(require, exports, module){
require("b/1.0.0/index");
require("a/1.0.0/a");

});
define("b/1.0.0/index", [], function(require, exports, module){
require("c/1.0.0/index");
require("b/1.0.0/b");

});
define("c/1.0.0/index", [], function(require, exports, module){
require("c/1.0.0/c");

});
define("c/1.0.0/c", [], function(require, exports, module){
console.log('c');

});
define("b/1.0.0/b", [], function(require, exports, module){
console.log('b');

});
define("a/1.0.0/a", [], function(require, exports, module){
console.log('a');

});
