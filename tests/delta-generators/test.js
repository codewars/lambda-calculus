import {readFileSync} from "fs";
import {assert} from "chai";

import * as LC from "../../src/lambda-calculus.js";
LC.configure({ purity: "LetRec", numEncoding: "Scott" });

const solutionText = readFileSync(new URL("./solution.txt", import.meta.url), {encoding: "utf8"});
const {delta} = LC.compile(solutionText);

const {fin} = LC.compile(String.raw`
nil = \ _ _ x . x
cons = \ v l a . a (\ x _ . x) (\ b . b v l)
fin = cons 1 (cons 2 (cons 4 (cons 7 nil)))`);

const {inf} = LC.compile(String.raw`
succ = \ n _ f . f n
incr = \ n a . a (\ x _ . x) (\ b . b n (incr (succ n)))
inf = incr 0`);

const {toInt} = LC;

const Fst = fst => snd => fst ;
const Snd = fst => snd => snd ;
const head = xs => xs (Snd) (Fst) ;
const tail = xs => xs (Snd) (Snd) ;
const isNil = xs => xs (Fst) (false) (true) ;

function toArr(a, n) { // lists use double pair encoding, not Scott!
  const res = [];
  while ( n-->0 && ! isNil (a) )
    res.push(toInt(head(a))),
    a = tail(a);
  return res;
}

describe("delta-generators", () => {
  it("fixed tests", function() {
    LC.configure({ purity: "LetRec", numEncoding: "Scott" });
    assert.deepEqual( toArr( delta (2) (fin), 2 ), [1, 1] );
    assert.deepEqual( toArr( delta (1) (inf), 10 ), [1,1,1,1,1,1,1,1,1,1] );
  });
});
