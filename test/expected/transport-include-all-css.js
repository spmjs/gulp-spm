define("a/1.0.0/index", [], function(require, exports, module){
require("b/1.0.0/index.css.js");
require("d/1.0.0/index");
require("a/1.0.0/a.css.js");

});
define("b/1.0.0/index.css.js", [], function(require, exports, module){
require("import-style/1.0.0/index")('html,body{margin:0;}div{padding:0;}body{background:red;}');

});
define("d/1.0.0/index", [], function(require, exports, module){
require("c/1.0.0/index.css.js");

});
define("c/1.0.0/index.css.js", [], function(require, exports, module){
require("import-style/1.0.0/index")('div{padding:0;}');

});
define("a/1.0.0/a.css.js", [], function(require, exports, module){
require("import-style/1.0.0/index")('div{padding:0;}a{color:#000;}');

});
