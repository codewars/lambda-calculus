import {readFileSync} from "fs";
import {assert} from "chai";

import * as LC from "../../src/lambda-calculus.js";

const Zero =      end => even => odd => end ;
const Bit0 = n => end => even => odd => even(n) ;
const Bit1 = n => end => even => odd => odd (n) ;
const fromInt = n => n ? n&1 ? Bit1(fromInt(-(n>>1))) : Bit0(fromInt(-(n>>1))) : Zero ;
const padded = m => m (false) ( n => n (true) ( () => padded(n) ) (padded) ) (padded) ;
const unsafeToInt = m => m (0) ( n => - 2 * unsafeToInt(n) ) ( n => 1 - 2 * unsafeToInt(n) ) ;
const toInt = n => {
  if ( padded(n) )
    throw new TypeError(`toInt: padded number ${ unsafeToInt(n) }`);
  else
    return unsafeToInt(n);
} ;
LC.configure({ purity: "LetRec", numEncoding: { fromInt, toInt } });

const solutionText = readFileSync(new URL("./solution.lc", import.meta.url), {encoding: "utf8"});
const solution = LC.compile(solutionText);
const { succ,pred, add,negate,sub, zero, lt0,le0,ge0,gt0,compare } = solution;

const toBoolean = p => p (true) (false) ;
const toOrdering = cmp => cmp ("LT") ("EQ") ("GT") ;

describe("NegaBinaryScott", () => {
  it("numbers", () => {
    LC.configure({ purity: "LetRec", numEncoding: { fromInt, toInt } });
    for ( let n=-10; n<=10; n++ )
      assert.strictEqual( toInt(fromInt(n)), n, `toInt (fromInt ${ n })` );
  });
  it("succ", () => {
    for ( let n=-10; n<=10; n++ )
      assert.strictEqual( toInt(succ(n)), n+1, `succ ${ n }` );
  });
  it("pred", () => {
    for ( let n=-10; n<=10; n++ )
      assert.strictEqual( toInt(pred(n)), n-1, `pred ${ n }` );
  });
  it("add", () => {
    for ( let m=-10; m<=10; m++ )
      for ( let n=-10; n<=10; n++ )
        assert.strictEqual( toInt(add(m)(n)), m+n, `add ${ m } ${ n }` );
  });
  it("negate", () => {
    for ( let n=-10; n<=10; n++ )
      assert.strictEqual( toInt(negate(n)), -n, `negate ${ n }` );
  });
  it("negate . negate", () => {
    for ( let n=-10; n<=10; n++ )
      assert.strictEqual( toInt(negate(negate(n))), n, `negate (negate ${ n })` );
  });
  it("sub", () => {
    for ( let m=-10; m<=10; m++ )
      for ( let n=-10; n<=10; n++ )
        assert.strictEqual( toInt(sub(m)(n)), m-n, `sub ${ m } ${ n }` );
  });
  it("eq, uneq", () => {
    for ( let n=-10; n<=10; n++ )
      assert.strictEqual(toBoolean(zero(n)),n===0,`zero ${ n }`),
      assert.strictEqual(toBoolean(lt0(n)),n<0,`lt0 ${ n }`),
      assert.strictEqual(toBoolean(le0(n)),n<=0,`le0 ${ n }`),
      assert.strictEqual(toBoolean(ge0(n)),n>=0,`ge0 ${ n }`),
      assert.strictEqual(toBoolean(gt0(n)),n>0,`gt0 ${ n }`);
  });
  it("compare", () => {
    for ( let m=-10; m<=10; m++ )
      for ( let n=-10; n<=10; n++ )
        assert.strictEqual( toOrdering(compare(m)(n)), m > n ? "GT" : m < n ? "LT" : "EQ" , `compare ${ m } ${ n }` );
  });
});