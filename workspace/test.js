import { assert, config as chaiConfig } from "chai";
chaiConfig.truncateThreshold = 0;

import * as LC from "@codewars/lambda-calculus";
import { solution } from "./files.js"; // /workspace/files.js

LC.config.purity = "Let";
LC.config.numEncoding = "Church";
const toInt = LC.toIntWith(LC.config);
const { counter } = LC.compile(solution());

const T = t => _ => t;
const F = _ => f => f;

describe("counter", () => {
  it("fixed tests", () => {
    assert.strictEqual(toInt(counter(T)(T)(T)(F)), 3);
    assert.strictEqual(toInt(counter(T)(F)), 1);
    assert.strictEqual(toInt(counter(T)(T)(T)(T)(T)(T)(T)(F)), 7);
  });
});
