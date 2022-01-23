const LC = require("lambda-calculus.js");
const assert = require("assert");
const chai = require("chai");
chai.config.truncateThreshold = 0;

// Uses LC-Codewars for compilation
// https://github.com/Kacarott/LC-Codewars

LC.config.purity = "Let";
LC.config.numEncoding = "Church";

const solution = compile().example;

describe("Sample tests", function() {
  it("should return True", function() {
    assert.equal(solution(true)(false), true)
  });
});
