define("a/1.0.0/index-debug", [], function(require, exports, module){
require("a/1.0.0/a.runtime-debug");
require("a/1.0.0/jquery.plugin-debug");
require("a/1.0.0/a-debug.tpl");
require("a/1.0.0/src/index-debug");
require("a/1.0.0/src/one.two.three-debug");

});
define("a/1.0.0/a.runtime-debug", [], function(require, exports, module){
console.log('a.runtime.js');

});
define("a/1.0.0/jquery.plugin-debug", [], function(require, exports, module){
console.log('jquery.plugin.js');

});
define("a/1.0.0/a-debug.tpl", [], function(require, exports, module){
module.exports = '<div></div>';

});
define("a/1.0.0/src/index-debug", [], function(require, exports, module){
console.log('src/index.js');

});
define("a/1.0.0/src/one.two.three-debug", [], function(require, exports, module){
console.log('src/one.two.three.js');

});
