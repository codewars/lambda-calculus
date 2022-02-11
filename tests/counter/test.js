import {readFileSync} from "fs";
import {assert, config as chaiConfig} from "chai";
chaiConfig.truncateThreshold = 0;

import * as LC from "../../src/lambda-calculus.js";
LC.config.purity = "Let";
LC.config.numEncoding = "Church";
const solutionText = readFileSync(new URL("./solution.txt", import.meta.url), {encoding: "utf8"});
const {counter} = LC.compile(solutionText);

const toInt = LC.toIntWith(LC.config);

const T = t => f => t ;
const F = t => f => f ;

describe("counter", () => {
  it("fixed tests", function() {
    assert.deepEqual( toInt( counter(T)(T)(T)(F) ), 3 );
    assert.deepEqual( toInt( counter(T)(F) ), 1 );
    assert.deepEqual( toInt( counter(T)(T)(T)(T)(T)(T)(T)(F) ), 7 );
  });
});
