import {readFileSync} from "fs";
import {assert, config as chaiConfig} from "chai";
chaiConfig.truncateThreshold = 0;

// Uses LC-Codewars for compilation
// https://github.com/codewars/lambda-calculus
import * as LC from "@codewars/lambda-calculus";
LC.config.purity = "Let";
LC.config.numEncoding = "Church";

const solutionText = readFileSync(new URL("./solution.txt", import.meta.url), {encoding: "utf8"});
const solution = LC.compile(solutionText).example;

describe("Sample tests", function() {
  it("should return True", function() {
    assert.equal(solution(true)(false), true)
  });
});
