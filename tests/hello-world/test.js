const {config, compile, T, F, toInt} = require("../../src/lambda-calculus.js");
const assert = require("assert");
const chai = require("chai");

const fs = require("fs");

let solutionText;
try{
  solutionText = fs.readFileSync("./solution.txt", "utf8");
} catch (err) {
  console.error(err);
}

chai.config.truncateThreshold = 0;

// const LC = { compile: () => compile(code), config: options } // Temporary. Would normally import, see line above.
config.purity = "Let";
config.numEncoding = "Church";

const solution = compile(solutionText).hello;

function _toString(term, res="") {
  if (term(T)(true)(false)) {
    const n = toInt(term(F)(T));
    return _toString(term(F)(F), res+String.fromCharCode(n));
  } else return res;
}
describe("Full tests", function() {
  it("Does it work?", function() {
    assert.equal(_toString(solution), "Hello, world!")
  });
});
