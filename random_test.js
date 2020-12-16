var a = ",,awe,wer,,,gf".split(",");
console.log(a);

var b = a.join(",");
console.log(b);

var c = a.filter(function (el) {
    return el != '';
  }).join(',');
console.log(c);