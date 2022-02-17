import {readFileSync} from "fs";
import {assert, config as chaiConfig} from "chai";
chaiConfig.truncateThreshold = 0;

import * as LC from "../../src/lambda-calculus.js";
LC.configure({ purity: "LetRec", numEncoding: "Scott" });

const solutionText = readFileSync(new URL("./solution.txt", import.meta.url), {encoding: "utf8"});
const {isPrime} = LC.compile(solutionText);

describe("is-prime-scott",function(){
  this.timeout(12e3);
  it("fixed tests",()=>{
    LC.configure({ purity: "LetRec", numEncoding: "Scott" });
    assert.equal( isPrime( 0) (true)(false), false );
    assert.equal( isPrime( 1) (true)(false), false );
    assert.equal( isPrime( 2) (true)(false), true );
    assert.equal( isPrime( 3) (true)(false), true );
    assert.equal( isPrime( 4) (true)(false), false );
    assert.equal( isPrime( 5) (true)(false), true );
    assert.equal( isPrime( 6) (true)(false), false );
    assert.equal( isPrime( 7) (true)(false), true );
    assert.equal( isPrime( 8) (true)(false), false );
    assert.equal( isPrime( 9) (true)(false), false );
    assert.equal( isPrime(10) (true)(false), false );
    assert.equal( isPrime(11) (true)(false), true );
    assert.equal( isPrime(12) (true)(false), false );
    assert.equal( isPrime(13) (true)(false), true );
    assert.equal( isPrime(14) (true)(false), false );
    assert.equal( isPrime(15) (true)(false), false );
    assert.equal( isPrime(16) (true)(false), false );
    assert.equal( isPrime(17) (true)(false), true );
    assert.equal( isPrime(18) (true)(false), false );
    assert.equal( isPrime(19) (true)(false), true );
  });
});
