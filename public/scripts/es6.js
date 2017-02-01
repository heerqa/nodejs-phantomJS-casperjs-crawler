"use strict";

console.log(x);
x = 5;

function test() {
  var count = 1;
  if (count == 1) {
    var _count = 3;
    console.log(_count);
  }

  console.log(count);
}

var x;

test();