define("a/1.0.0/index", ["b","c","a/1.0.0/a"], function(require, exports, module){
require('b');
require("a/1.0.0/a");

});
