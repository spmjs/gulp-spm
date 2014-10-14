define("c/1.0.0/index", ["import-style/1.0.0/index"], function(require, exports, module){
require("c/1.0.0/c");
require("c/1.0.0/index.css.js");

});
define("c/1.0.0/c", [], function(require, exports, module){
console.log('c');

});
define("c/1.0.0/index.css.js", ["import-style/1.0.0/index"], function(require, exports, module){
require("import-style/1.0.0/index")('body{margin:0;}');

});
