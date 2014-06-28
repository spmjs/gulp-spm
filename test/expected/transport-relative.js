define("type-transport/1.0.0/index", ["type-transport/1.0.0/a.css.js","type-transport/1.0.0/a.json","type-transport/1.0.0/a.tpl","type-transport/1.0.0/a.handlebars","type-transport/1.0.0/a","handlebars-runtime/1.3.0/handlebars"], function(require, exports, module){
require("type-transport/1.0.0/a.css.js");
require("type-transport/1.0.0/a.json");
require("type-transport/1.0.0/a.tpl");
require("type-transport/1.0.0/a.handlebars");
require("type-transport/1.0.0/a");

});
define("type-transport/1.0.0/a.css.js", ["import-style/1.0.0/index"], function(require, exports, module){
require("import-style/1.0.0/index")('body{color:#fff;_padding:0;*margin:0;border-color:transparent\\0;}');

});
define("type-transport/1.0.0/a.json", [], function(require, exports, module){
module.exports = {};

});
define("type-transport/1.0.0/a.tpl", [], function(require, exports, module){
module.exports = '<div></div>';

});
define("type-transport/1.0.0/a.handlebars", ["handlebars-runtime/1.3.0/handlebars"], function(require, exports, module){
var Handlebars = require("handlebars-runtime/1.3.0/handlebars")["default"];
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
define("type-transport/1.0.0/a", [], function(require, exports, module){
console.log('a');

});
