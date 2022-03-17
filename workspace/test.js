import { assert, LC, getSolution } from "./lc-test.js";

LC.configure({purity: "Let", numEncoding: "Church"});
const { counter } = LC.compile(getSolution());

const T = t => _ => t;
const F = _ => f => f;

describe("counter", () => {
  it("fixed tests", () => {
    assert.numEql(counter(T)(T)(T)(F), 3);
    assert.numEql(counter(T)(F), 1);
    assert.numEql(counter(T)(T)(T)(T)(T)(T)(T)(F), 7);
  });
});
