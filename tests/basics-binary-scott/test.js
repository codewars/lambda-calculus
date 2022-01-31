const chai = require("chai");
chai.config.truncateThreshold = 0;
const {assert} = chai;

const LC = require("../../src/lambda-calculus.js");
LC.config.purity = "LetRec";
LC.config.numEncoding = "BinaryScott";

const solution = LC.compile();
const fromInt = LC.fromIntWith(LC.config);
const toInt = LC.toIntWith(LC.config);

it("fixed tests", function() {
  this.timeout(1e3);
  // console.log(toInt(solution.zero).term.toString());
  assert.equal( solution.zero, 0 );
  // assert.strictEqual( toInt(solution.one), 1 );
  // assert.strictEqual( toInt(solution.two), 2 );
  // assert.strictEqual( toInt(solution.three), 3 );
  // assert.strictEqual( toInt(solution.four), 4 );
});
