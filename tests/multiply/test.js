const {assert} = require("chai");

const LC = require("../../src/lambda-calculus.js");
LC.config.purity = "LetRec";
LC.config.numEncoding = "Church";
LC.config.verbosity = "Concise";

const {multiply} = LC.compile();

describe("Multiply",function(){
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
});