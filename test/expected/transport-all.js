define("simple-transport/1.0.0/index", ["b"], function(require, exports, module){
require("simple-transport/1.0.0/relative1");
require("simple-transport/1.0.0/relative2");
console.log('');
require("c/1.1.1/index");

});
define("simple-transport/1.0.0/relative1", ["b"], function(require, exports, module){
require("simple-transport/1.0.0/relative2");
console.log('relative1');
require("simple-transport/1.0.0/relative3");

});
define("simple-transport/1.0.0/relative2", ["b"], function(require, exports, module){
require("simple-transport/1.0.0/relative3");
console.log('relative2');
require('b');

});
define("simple-transport/1.0.0/relative3", [], function(require, exports, module){
console.log('relative3');
require("d/0.1.1/index");

});
define("d/0.1.1/index", [], function(require, exports, module){
exports.d = function() {
  console.log('0.1.1');
};

});
define("c/1.1.1/index", [], function(require, exports, module){
require("d/0.1.0/index");

});
define("d/0.1.0/index", [], function(require, exports, module){
exports.d = function() {
  console.log('0.1.0');
};

});
