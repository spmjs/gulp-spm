define("a/1.0.0/index", [], function(require, exports, module){
require("a/1.0.0/a.runtime");
require("a/1.0.0/jquery.plugin");
require("a/1.0.0/a.tpl");
require("a/1.0.0/src/index");
require("a/1.0.0/src/one.two.three");

});
define("a/1.0.0/a.runtime", [], function(require, exports, module){
console.log('a.runtime.js');

});
define("a/1.0.0/jquery.plugin", [], function(require, exports, module){
console.log('jquery.plugin.js');

});
define("a/1.0.0/a.tpl", [], function(require, exports, module){
module.exports = '<div></div>';

});
define("a/1.0.0/src/index", [], function(require, exports, module){
console.log('src/index.js');

});
define("a/1.0.0/src/one.two.three", [], function(require, exports, module){
console.log('src/one.two.three.js');

});
