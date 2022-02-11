import {readFileSync} from "fs";

import {assert, config as chaiConfig} from "chai";
chaiConfig.truncateThreshold = 0;

import * as LC from "../../src/lambda-calculus.js";
LC.config.purity = "LetRec";
LC.config.numEncoding = "Church";
LC.config.verbosity = "Concise";

const solutionText = readFileSync(new URL("./solution.txt", import.meta.url), {encoding: "utf8"});
const {multiply} = LC.compile(solutionText);
const fromInt = LC.fromIntWith(LC.config);
const toInt = LC.toIntWith(LC.config);

describe("Multiply",()=>{

    it("example tests",function(){
      assert.equal( toInt(multiply(fromInt(7))(fromInt(7))), 49 );
      assert.equal( toInt(multiply(fromInt(11))(fromInt(11))), 121 );
    });

    it("random tests",function(){
      const rnd = (m,n=0) => Math.random() * (n-m) + m | 0 ;
      for ( let i=1; i<=100; i++ ) {
        const m = rnd(i), n = rnd(i);
        assert.equal( toInt(multiply(fromInt(m))(fromInt(n))), m*n );
      }
    });
});
