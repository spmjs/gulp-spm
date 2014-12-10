;(function() {
var camel_case_100_c, b_100_b, b_100_c, import_style_100_index, camel_case_100_indexcssjs, my_package_100_a, camel_case_100_index, b_100_index, my_package_100_src_index;
camel_case_100_c = function () {
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
camel_case_100_indexcssjs = function () {
  import_style_100_index('body{margin:0;}');
}();
my_package_100_a = function () {
  b_100_c;
  console.log('a');
}();
camel_case_100_index = function () {
  camel_case_100_c;
  camel_case_100_indexcssjs;
}();
b_100_index = function () {
  camel_case_100_index;
  b_100_b;
}();
my_package_100_src_index = function () {
  b_100_index;
  my_package_100_a;
}();
}());
