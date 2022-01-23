const chai = require("chai");
const assert = chai.assert;
chai.config.truncateThreshold = 0;

const LC = require("../../src/lambda-calculus.js");
// const LC = { compile: text => compile(text || code), config: options } // Temporary. Would normally import, see line above.
LC.config.purity = "LetRec";
LC.config.numEncoding = "Scott";

const solution = LC.compile();

const fin = LC.compile(String.raw`
nil = \ _ _ x . x
cons = \ v l a . a (\ x _ . x) (\ b . b v l)
input = cons 1 (cons 2 (cons 4 (cons 7 nil)))`).input;

const inf = LC.compile(String.raw`
succ = \ n _ f . f n
incr = \ n a . a (\ x _ . x) (\ b . b n (incr (succ n)))
input = incr 0`).input;

const True = LC.T;
const False = LC.F;

const toBool = t => t(true)(false);
const toInt = n => {
  const prev = LC.config.numEncoding;
  LC.config.numEncoding = "Scott";
  const res = LC.toInt(n);
  LC.config.numEncoding = prev;
  return res;
};

function toArr(a, n) {
  const res = [];
  while (n--) {
    if (!toBool(a(True))) break;
    res.push(toInt(a(False)(True)));
    a = a(False)(False);
  }
  return res;
}

const ZERO = z => s => z;
const SUCC = n => z => s => s(n);
const ONE = SUCC(ZERO);
const TWO = SUCC(ONE);

describe("Sample Tests", function() {
  it("Basics", function() {
    assert.deepEqual(toArr(solution.delta(TWO)(fin.term,fin.env),2), [1, 1]);
    assert.deepEqual(toArr(solution.delta(ONE)(inf.term,inf.env),10), Array(10).fill(1));
  });
});
