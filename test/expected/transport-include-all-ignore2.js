define("my-package/1.0.0/src/index", ["camel-case"], function(require, exports, module){
require("b/1.0.0/index");
require("my-package/1.0.0/a");

});
define("b/1.0.0/index", ["camel-case"], function(require, exports, module){
require('camel-case');
require("b/1.0.0/b");

});
define("b/1.0.0/b", [], function(require, exports, module){
console.log('b');

});
define("my-package/1.0.0/a", [], function(require, exports, module){
require("b/1.0.0/c");
console.log('a');

});
define("b/1.0.0/c", [], function(require, exports, module){
console.log('b/c.js');

});
