define("a/1.0.0/index-3a9e238e", ["b/1.1.0/index-998790d7","handlebars-runtime/1.3.0/handlebars-2f3d1a73"], function(require, exports, module){
require("a/1.0.0/a-77d5c9d3");
require("a/1.0.0/a-aff38bc7.handlebars");
require("b/1.1.0/index-998790d7");

});
define("a/1.0.0/a-77d5c9d3", [], function(require, exports, module){
console.log('a');

});
define("a/1.0.0/a-aff38bc7.handlebars", ["handlebars-runtime/1.3.0/handlebars-2f3d1a73"], function(require, exports, module){
var Handlebars = require("handlebars-runtime/1.3.0/handlebars-2f3d1a73")["default"];
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div>";
  if (helper = helpers.context) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.context); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</div>\n";
  return buffer;
  });

});
