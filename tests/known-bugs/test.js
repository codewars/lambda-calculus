import {readFileSync} from "fs";
import {assert, config as chaiConfig} from "chai";
chaiConfig.truncateThreshold = 0;

import * as LC from "../../src/lambda-calculus.js";
LC.configure({ purity: "Let", numEncoding: "None" });

const solutionText = readFileSync(new URL("./solution.txt", import.meta.url), {encoding: "utf8"});
const { foo } = LC.compile(solutionText);

describe("No side effects", () => {
  it("The initial failed call used to cause the second call to behave weirdly", () => {
    try {
      foo("hi")("there")("world")
    } catch {}
    assert.strictEqual( foo(null).term.toString(), "\\ j c . x c ()" );
  });
});
