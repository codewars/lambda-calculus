import {readFileSync} from "fs";
import {assert, config as chaiConfig} from "chai";
chaiConfig.truncateThreshold = 0;

import * as LC from "../../src/lambda-calculus.js";
LC.configure({ purity: "Let", numEncoding: "Church" });

const solutionText = readFileSync(new URL("./solution.txt", import.meta.url), {encoding: "utf8"});
const {counter} = LC.compile(solutionText);

const T = t => f => t ;
const F = t => f => f ;

describe("counter", () => {
  it("fixed tests", function() {
    LC.configure({ purity: "Let", numEncoding: "Church" });
    assert.equal( counter(T)(T)(T)(F), 3 );
    assert.equal( counter(T)(F), 1 );
    assert.equal( counter(T)(T)(T)(T)(T)(T)(T)(F), 7 );
  });
});
