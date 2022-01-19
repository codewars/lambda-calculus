const {config, compile, toInt, T, F} = require("../../src/lambda-calculus.js");
const chai = require("chai");
const assert = chai.assert;
chai.config.truncateThreshold = 0;

// const LC = { compile: text => compile(text || code), config: options } // Temporary. Would normally import, see line above.
config.purity = "Let";
config.numEncoding = "Church";

const solution = compile();

describe("Sample Tests", function() {
  it("Basics", function() {
    assert.deepEqual(toInt(solution.counter(T)(T)(T)(F)), 3);
    assert.deepEqual(toInt(solution.counter(T)(F)), 1);
    assert.deepEqual(toInt(solution.counter(T)(T)(T)(T)(T)(T)(T)(F)), 7);
  });
});
