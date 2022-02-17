import { assert, LC, solution } from "./lc-test.js";

LC.configure({ purity: "Let", numEncoding: "Church" });
const { counter } = LC.compile(solution());

const T = t => _ => t;
const F = _ => f => f;

describe("counter", () => {
  it("fixed tests", () => {
    assert.equal( counter(T)(T)(T)(F), 3);
    assert.equal( counter(T)(F), 1);
    assert.equal( counter(T)(T)(T)(T)(T)(T)(T)(F), 7);
  });
});
