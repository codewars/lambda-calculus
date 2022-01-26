const chai = require("chai");
const {assert} = chai;
chai.config.truncateThreshold = 0;

const LC = require("../../src/lambda-calculus.js");
LC.config.purity = "Let";
LC.config.numEncoding = "Church";

const {counter} = LC.compile();

const toInt = LC.toIntWith(LC.config);

const T = t => f => t ;
const F = t => f => f ;

it("fixed tests", function() {
  assert.deepEqual( toInt( counter(T)(T)(T)(F) ), 3 );
  assert.deepEqual( toInt( counter(T)(F) ), 1 );
  assert.deepEqual( toInt( counter(T)(T)(T)(T)(T)(T)(T)(F) ), 7 );
});
