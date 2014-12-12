define("my-package/1.0.0/src/index", ["b","b/c.js"], function(require, exports, module){
require('b');
require("my-package/1.0.0/a");

});
define("my-package/1.0.0/a", ["b/c.js"], function(require, exports, module){
require('b/c.js');
console.log('a');

});
