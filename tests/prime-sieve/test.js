const chai = require("chai");
chai.config.truncateThreshold = 0;
const {assert} = chai;

// const LC = require("../../src/lambda-calculus.js");
const LC = { compile: () => compile(code), config } // Temporary. Would normally import, see line above.
LC.config.purity = "LetRec";
LC.config.numEncoding = "Scott";
LC.config.verbosity = "Concise";

const {primes} = LC.compile();
// const fromInt = LC.fromIntWith(LC.config);
// const toInt = LC.toIntWith(LC.config);
// const {fromInt,toInt} = LC;
const head = xs => xs ( x => xs => x ) ;
const tail = xs => xs ( x => xs => xs ) ;
const take = n => xs => n ? [ head(xs), ...take(n-1)(tail(xs)) ] : [] ;

it("fixed tests: primes", function() {
  this.timeout(12e3);
  assert.equal( head(primes), 2 );
  assert.equal( head(tail(primes)), 3 );
  assert.equal( head(tail(tail(primes))), 5 );
  assert.equal( head(tail(tail(tail(primes)))), 7 );
  assert.deepEqual( take(10)(primes).map(toInt), [2,3,5,7,11,13,17,19,23,29] );
});
