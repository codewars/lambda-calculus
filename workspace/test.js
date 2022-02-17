// test.js

import * as LC from "./lc-test.js";
LC.config.truncateThreshold = 0;
LC.configure({ purity: "Let", numEncoding: "Church" });

const {counter} = LC.compile(getSolution());
const {toInt} = LC;

const T = t => _ => t;
const F = _ => f => f;

describe("counter", () => {
  it("fixed tests", () => {
    assert.strictEqual(toInt(counter(T)(T)(T)(F)), 3);
    assert.strictEqual(toInt(counter(T)(F)), 1);
    assert.strictEqual(toInt(counter(T)(T)(T)(T)(T)(T)(T)(F)), 7);
  });
});
