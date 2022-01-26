const chai = require("chai");
const {assert} = chai;
chai.config.truncateThreshold = 0;

const LC = require("../../src/lambda-calculus.js");
LC.config.purity = "LetRec";
LC.config.numEncoding = "Church";

const {isPrime} = LC.compile();

it("fixed tests", function() {
  this.timeout(12000);
  assert.equal( isPrime(0) (true)(false), false );
  assert.equal( isPrime(1) (true)(false), false );
  assert.equal( isPrime(2) (true)(false), true );
  assert.equal( isPrime(3) (true)(false), true );
  assert.equal( isPrime(4) (true)(false), false );
  assert.equal( isPrime(5) (true)(false), true );
  assert.equal( isPrime(6) (true)(false), false );
  assert.equal( isPrime(7) (true)(false), true );
  assert.equal( isPrime(8) (true)(false), false );
  assert.equal( isPrime(9) (true)(false), false );
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
