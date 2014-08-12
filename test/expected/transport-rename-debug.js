define("type-transport/1.0.0/index-debug", ["handlebars-runtime/1.3.0/handlebars-debug","import-style/1.0.0/index-debug"], function(require, exports, module){
require("type-transport/1.0.0/a-debug.css.js");
require("type-transport/1.0.0/a-debug.json");
require("type-transport/1.0.0/a-debug.tpl");
require("type-transport/1.0.0/a-debug.html");
require("type-transport/1.0.0/a-debug.handlebars");
require("type-transport/1.0.0/a-debug");

});
define("type-transport/1.0.0/a-debug.css.js", ["import-style/1.0.0/index-debug"], function(require, exports, module){
require("import-style/1.0.0/index-debug")('body{color:#fff;_padding:0;*margin:0;border-color:transparent\\0;}');

});
define("type-transport/1.0.0/a-debug.json", [], function(require, exports, module){
module.exports = {"a":1};

});
define("type-transport/1.0.0/a-debug.tpl", [], function(require, exports, module){
module.exports = '<div></div>';

});
define("type-transport/1.0.0/a-debug.html", [], function(require, exports, module){
module.exports = '<div></div>';

});
define("type-transport/1.0.0/a-debug.handlebars", ["handlebars-runtime/1.3.0/handlebars-debug"], function(require, exports, module){
var Handlebars = require("handlebars-runtime/1.3.0/handlebars-debug")["default"];
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div>";
  if (helper = helpers.content) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.content); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</div>\n";
  return buffer;
  });

});
define("type-transport/1.0.0/a-debug", [], function(require, exports, module){
console.log('a');

});
