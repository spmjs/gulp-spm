;(function() {
var c_100_c, b_100_b, b_100_c, import_style_100_index, c_100_indexcssjs, a_100_a, c_100_index, b_100_index, a_100_src_index;
c_100_c = function () {
  console.log('c');
}();
b_100_b = function () {
  console.log('b');
}();
b_100_c = function () {
  console.log('b/c.js');
}();
import_style_100_index = function (exports) {
  exports = function importStyle(str) {
    return '';
  };
  return exports;
}();
c_100_indexcssjs = function () {
  import_style_100_index('body{margin:0;}');
}();
a_100_a = function () {
  b_100_c;
  console.log('a');
}();
c_100_index = function () {
  c_100_c;
  c_100_indexcssjs;
}();
b_100_index = function () {
  c_100_index;
  b_100_b;
}();
a_100_src_index = function () {
  b_100_index;
  a_100_a;
}();

if (typeof exports == "object") {
  module.exports = a_100_src_index;
} else if (typeof define == "function" && (define.cmd || define.amd)) {
  define(function(){ return a_100_src_index });
} else {
  this["a"] = a_100_src_index;
}
}());