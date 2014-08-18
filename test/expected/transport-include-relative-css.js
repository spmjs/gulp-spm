define("a/1.0.0/index", ["d/1.0.0/index","import-style/1.0.0/index"], function(require, exports, module){
require("b/1.0.0/index.css.js");
require("d/1.0.0/index");
require("a/1.0.0/a.css.js");
require("e/1.0.0/e1.css.js");

});
define("b/1.0.0/index.css.js", ["import-style/1.0.0/index"], function(require, exports, module){
require("import-style/1.0.0/index")('html,body{margin:0;}div{padding:0;}body{background:red;}');

});
define("a/1.0.0/a.css.js", ["import-style/1.0.0/index"], function(require, exports, module){
require("import-style/1.0.0/index")('div{padding:0;}a{color:#000;}');

});
define("e/1.0.0/e1.css.js", ["import-style/1.0.0/index"], function(require, exports, module){
require("import-style/1.0.0/index")('.e1{background:#e1e1e1;}');

});
