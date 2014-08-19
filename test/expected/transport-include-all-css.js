define("a/1.0.0/index", [], function(require, exports, module){
require("b/1.0.0/index.css.js");
require("d/1.0.0/index");
require("a/1.0.0/a.css.js");
require("e/1.0.0/e1.css.js");

});
define("b/1.0.0/index.css.js", [], function(require, exports, module){
require("import-style/1.0.0/index")('html,body{margin:0;}div{padding:0;}body{background:red;}');

});
define("d/1.0.0/index", [], function(require, exports, module){
require("d/1.0.0/d.css.js");
require("e/1.0.0/e2.css.js");

});
define("d/1.0.0/d.css.js", [], function(require, exports, module){
require("import-style/1.0.0/index")('div{margin:0;}');

});
define("e/1.0.0/e2.css.js", [], function(require, exports, module){
require("import-style/1.0.0/index")('.e2{background:#e1e1e1;}');

});
define("a/1.0.0/a.css.js", [], function(require, exports, module){
require("import-style/1.0.0/index")('div{padding:0;}a{color:#000;}');

});
define("e/1.0.0/e1.css.js", [], function(require, exports, module){
require("import-style/1.0.0/index")('.e1{background:#e1e1e1;}');

});
define("import-style/1.0.0/index", [], function(require, exports, module){
module.exports = function importStyle(str) {
  return '';
};

});
