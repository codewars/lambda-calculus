import {readFileSync} from "fs";

import {assert, config as chaiConfig} from "chai";
chaiConfig.truncateThreshold = 0;

import * as LC from "../../src/lambda-calculus.js";
LC.config.purity = "LetRec";
LC.config.numEncoding = "Church";
// LC.config.verbosity = "Concise"; // reinstate for production

const solutionText = readFileSync(new URL("./solution.txt", import.meta.url), {encoding: "utf8"});

describe("Multiply",function(){
  // REVIEW Is this intentional? If so, it should be tested that `compile` throws
  // and remove other test cases.
  try {
    const {multiply} = LC.compile(solutionText);
    it("example tests",()=>{
      assert.equal( multiply(7)(7), 49 );
      assert.equal( multiply(11)(11), 121 );
    });
    it("random tests",()=>{
      const rnd = (m,n=0) => Math.random() * (n-m) + m | 0 ;
      for ( let i=1; i<=100; i++ ) {
        const m = rnd(i), n = rnd(i);
        assert.equal( multiply(m)(n), m*n );
      }
    });
  } catch (e) {
    console.error(e);
  }
});
