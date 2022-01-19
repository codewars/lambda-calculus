const chai = require("chai");
const assert = chai.assert;
chai.config.truncateThreshold = 0;
const {config, compile, toInt, T, F} = require("../../src/lambda-calculus.js");

// const LC = { compile: () => compile(code), config } // Temporary. Would normally import, see line above.
config.purity = "LetRec";
config.numEncoding = "Church";

const solution = compile();
const {isPrime} = solution;

describe("Sample Tests", function() {
  it("Basics", function() {
    assert.equal(isPrime(0) (true)(false), false);
    assert.equal(isPrime(1) (true)(false), false);
    assert.equal(isPrime(2) (true)(false), true);
    assert.equal(isPrime(3) (true)(false), true);
    assert.equal(isPrime(4) (true)(false), false);
    assert.equal(isPrime(5) (true)(false), true);
    assert.equal(isPrime(6) (true)(false), false);
    assert.equal(isPrime(7) (true)(false), true);
    assert.equal(isPrime(8) (true)(false), false);
    assert.equal(isPrime(9) (true)(false), false);
    assert.equal(isPrime(10) (true)(false), false);
    assert.equal(isPrime(11) (true)(false), true);
    assert.equal(isPrime(12) (true)(false), false);
    assert.equal(isPrime(13) (true)(false), true);
    // assert.equal(isPrime(14) (true)(false), false);
    // assert.equal(isPrime(15) (true)(false), false);
    // assert.equal(isPrime(16) (true)(false), false);
    // assert.equal(isPrime(17) (true)(false), true);
    // assert.equal(isPrime(18) (true)(false), false);
    // assert.equal(isPrime(19) (true)(false), true);
  });
});
