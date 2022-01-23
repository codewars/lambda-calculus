// Run all example tests

const { chdir } = require("process");
const { readdirSync } = require("fs");

const examples = [
  "hello-world",
  "counter",
  "delta-generators", // for some reason breaks tests
  "is-prime",
];

try {
  chdir("tests");
  for (const example of examples) {
    describe(example, function() {
      chdir("./" + example);
      require("./" + example + "/test.js");
      chdir("..");
    });
  }
  chdir("..");
} catch (err) {
  console.error(err);
}
