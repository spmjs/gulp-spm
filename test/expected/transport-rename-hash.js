define("a/1.0.0/index-e16dba71", ["b/1.1.0/index-beb5e20c","handlebars-runtime/1.3.0/handlebars-6d71154c"], function(require, exports, module){
require("a/1.0.0/a-981454e8");
require("a/1.0.0/a-2d503fe3.handlebars");
require("b/1.1.0/index-beb5e20c");

});
define("a/1.0.0/a-981454e8", [], function(require, exports, module){
console.log('a');

});
define("a/1.0.0/a-2d503fe3.handlebars", ["handlebars-runtime/1.3.0/handlebars-6d71154c"], function(require, exports, module){
var Handlebars = require("handlebars-runtime/1.3.0/handlebars-6d71154c")["default"];
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
