define("my-package/1.0.0/src/index", [], function(require, exports, module){
require("b/1.0.0/index");
require("my-package/1.0.0/a");

});
define("b/1.0.0/index", [], function(require, exports, module){
require("camel-case/1.0.0/index");
require("b/1.0.0/b");

});
define("camel-case/1.0.0/index", [], function(require, exports, module){
require("camel-case/1.0.0/c");
require("camel-case/1.0.0/index.css.js");

});
define("camel-case/1.0.0/c", [], function(require, exports, module){
console.log('c');

});
define("camel-case/1.0.0/index.css.js", [], function(require, exports, module){
require("import-style/1.0.0/index")('body{margin:0;}');

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
define("import-style/1.0.0/index", [], function(require, exports, module){
module.exports = function importStyle(str) {
  return '';
};

});
