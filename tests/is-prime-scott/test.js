const chai = require("chai");
chai.config.truncateThreshold = 0;
const {assert} = chai;

// const LC = require("../../src/lambda-calculus.js");
const LC = { compile: () => compile(code), config } // Temporary. Would normally import, see line above.
LC.config.purity = "LetRec";
LC.config.numEncoding = "Scott";

const {isPrime} = LC.compile();
// const fromInt = LC.fromIntWith(LC.config);

it("fixed tests", function() {
  this.timeout(12e3);
  assert.equal( isPrime(fromInt( 0)) (true)(false), false );
  assert.equal( isPrime(fromInt( 1)) (true)(false), false );
  assert.equal( isPrime(fromInt( 2)) (true)(false), true );
  assert.equal( isPrime(fromInt( 3)) (true)(false), true );
  assert.equal( isPrime(fromInt( 4)) (true)(false), false );
  assert.equal( isPrime(fromInt( 5)) (true)(false), true );
  assert.equal( isPrime(fromInt( 6)) (true)(false), false );
  assert.equal( isPrime(fromInt( 7)) (true)(false), true );
  assert.equal( isPrime(fromInt( 8)) (true)(false), false );
  assert.equal( isPrime(fromInt( 9)) (true)(false), false );
  assert.equal( isPrime(fromInt(10)) (true)(false), false );
  assert.equal( isPrime(fromInt(11)) (true)(false), true );
  assert.equal( isPrime(fromInt(12)) (true)(false), false );
  assert.equal( isPrime(fromInt(13)) (true)(false), true );
  assert.equal( isPrime(fromInt(14)) (true)(false), false );
  assert.equal( isPrime(fromInt(15)) (true)(false), false );
  assert.equal( isPrime(fromInt(16)) (true)(false), false );
  assert.equal( isPrime(fromInt(17)) (true)(false), true );
  assert.equal( isPrime(fromInt(18)) (true)(false), false );
  assert.equal( isPrime(fromInt(19)) (true)(false), true );
});
