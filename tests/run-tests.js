// Run all example tests

const { chdir } = require("process");
const { readdirSync } = require("fs");

const examples = [
  "hello-world"
];

try {
  chdir("tests");
  for (const example of examples) {
    chdir("./" + example);
    describe(example, () => {
      console.log(readdirSync("."));
      require("./" + example + "/test.js");
    });
    chdir("..");
  }
  chdir("..");
} catch (err) {
  console.error(err);
}
