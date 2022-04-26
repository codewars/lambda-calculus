import {readFileSync} from "fs";
import {assert} from "chai";

import * as LC from "../../src/lambda-calculus.js";
LC.configure({ purity: "LetRec", numEncoding: "BinaryScott" });

const solutionText = readFileSync(new URL("./solution.txt", import.meta.url), {encoding: "utf8"});
const solution = LC.compile(solutionText);
const {fromInt,toInt} = LC;

const {False,True,not,and,or,xor,implies} = solution;
const {LT,EQ,GT,compare,lt,le,eq,ge,gt} = solution;
const {Pair,fst,snd,first,second,both,bimap,curry} = solution;
const {shiftR0,shiftR1,shiftL,dbl,isStrictZero,isZero,pad,unpad,isPadded} = solution;
const {succ,pred} = solution;
const {bitAnd,bitOr,bitXor,testBit,bit,popCount,even,odd} = solution;
const {plus,times,minus,divMod,div,mod,pow,gcd,lcm,min,max} = solution;

const toString = n => n ( "$" ) ( z => '0' + toString(z) ) ( z => '1' + toString(z) ) ;
const toPair = xy => [ fst(xy), snd(xy) ] ;

const rnd = (m,n=0) => Math.random() * (n-m) + m | 0 ;
const refGCD = m => n => n ? refGCD(n)(m%n) : m ;

describe("Binary Scott tests",function(){
  this.timeout(0);
  it("enumeration",()=>{
    LC.configure({ purity: "LetRec", numEncoding: "BinaryScott" });
    const zero  = end => _odd => _even => end ;
    const one   = succ(zero);
    const two   = succ(one);
    const three = succ(two);
    const four  = succ(three);
    const five  = succ(four);
    assert.equal( toString(zero), "$" );
    assert.equal( toString(one), "1$" );
    assert.equal( toString(two), "01$" );
    assert.equal( toString(three), "11$" );
    assert.equal( toString(four), "001$" );
    assert.equal( toString(five), "101$" );
    assert.equal( toString(five), "101$" );
    assert.equal( toString(pred(five)), "001$" );
    assert.equal( toString(pred(pred(five))), "11$" );
    assert.equal( toString(pred(pred(pred(five)))), "01$" );
    assert.equal( toString(pred(pred(pred(pred(five))))), "1$" );
    assert.equal( toString(pred(pred(pred(pred(pred(five)))))), "$" );
  });
  it("successor",()=>{
    let n = 0;
    for ( let i=1; i<=100; i++ ) {
      n = succ (n);
      assert.equal( n, i );
    }
  });
  it("predecessor",()=>{
    let n = 100;
    for ( let i=100; i--; ) {
      n = pred (n);
      assert.equal( n, i );
    }
  });
  // enforcing the invariant means pred robustness is overrated
  // it("predecessor robustness",()=>{
  //   assert.equal( toString( pred ( 2 ) ), "1$" );
  //   assert.equal( toString( pred ( end => even => odd => end ) ), "$" );
  //   assert.equal( toString( pred ( end => even => odd => even (
  //                                  end => even => odd => end ) ) ), "$" );
  //   assert.equal( toString( pred ( end => even => odd => even (
  //                                  end => even => odd => even (
  //                                  end => even => odd => end ) ) ) ), "$" );
  // });
  it("ordering",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i*i), n = rnd(i*i);
      assert.equal( compare (fromInt(m)) (fromInt(n)) ("-1") ("0") ("1"), String(Number(m>n) - Number(m<n)) );
    }
  });
  it("comparison",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i*i), n = rnd(i*i);
      assert.equal( lt (fromInt(m)) (fromInt(n)) (false)(true), m < n );
      assert.equal( le (fromInt(m)) (fromInt(n)) (false)(true), m <= n );
      assert.equal( eq (fromInt(m)) (fromInt(n)) (false)(true), m == n );
      assert.equal( ge (fromInt(m)) (fromInt(n)) (false)(true), m >= n );
      assert.equal( gt (fromInt(m)) (fromInt(n)) (false)(true), m > n );
      assert.equal( eq (fromInt(m)) (fromInt(m)) (false)(true), true );
    }
  });
  it("addition",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i*i), n = rnd(i*i);
      assert.equal( plus (m) (n), m + n );
    }
  });
  it("multiplication",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i*i), n = rnd(i*i);
      assert.equal( times (m) (n), m * n );
    }
  });
  it("subtraction",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i*i), n = rnd(i*i);
      assert.equal( minus (m) (n), Math.max( 0, m - n ) );
      assert.equal( minus (n) (m), Math.max( 0, n - m ) );
    }
  });
  it("division",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i*i), n = rnd(i*i);
      assert.deepEqual( toPair( divMod (m) (n||1) ).map(toInt), [ m/(n||1)|0, m%(n||1) ] );
      assert.deepEqual( toPair( divMod (n) (m||1) ).map(toInt), [ n/(m||1)|0, n%(m||1) ] );
    }
  });
  it("exponentiation",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i), n = rnd(i%10);
      assert.equal( pow (m) (n), m ** n );
    }
  });
  it("greatest common divisor",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i), n = rnd(i);
      assert.equal( gcd (m) (n), refGCD(m)(n) );
    }
  });
  it("least common multiple",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i), n = rnd(i);
      assert.equal( lcm (m) (n), m / (refGCD(m)(n)||1) * n );
    }
  });
  it("minimum",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i*i), n = rnd(i*i);
      assert.equal( min (m) (n), Math.min(m,n) );
    }
  });
  it("maximum",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i*i), n = rnd(i*i);
      assert.equal( max (m) (n), Math.max(m,n) );
    }
  });
  it("shifting bits",()=>{
    for ( let i=1; i<=100; i++ ) {
      const n = rnd(i*i);
      assert.equal( shiftL (n), n >> 1 );
      assert.equal( dbl (n), n << 1 );
      assert.equal( shiftR1 (n), n << 1 | 1 );
    }
  });
  it("zero padding",()=>{
    for ( let i=1; i<=100; i++ ) {
      const n = rnd(i*i);
      assert.equal( isPadded (n) (false)(true), false );
      assert.equal( isPadded (pad(n)) (false)(true), true );
      assert.equal( isPadded (pad(pad(n))) (false)(true), true );
      assert.equal( isPadded (pad(pad(pad(n)))) (false)(true), true );
    }
  });
  it("bitwise and",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i*i), n = rnd(i*i);
      assert.equal( bitAnd (m) (n), m & n );
    }
  });
  it("bitwise or",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i*i), n = rnd(i*i);
      assert.equal( bitOr (m) (n), m | n );
    }
  });
  it("bitwise exclusive or",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i*i), n = rnd(i*i);
      assert.equal( bitXor (m) (n), m ^ n );
    }
  });
  it("testing bits",()=>{
    for ( let i=1; i<=100; i++ ) {
      const j = rnd(i%32), n = rnd(i*i);
      assert.equal( testBit (j) (n) (false)(true), Boolean( n & 1<<j ) ); // JS restricted to 32-bit
    }
  });
  it("setting bits",()=>{
    for ( let i=1; i<=100; i++ ) {
      const j = rnd(i%32);
      assert.equal( bit (j), 1<<j ); // JS restricted to 32-bit
    }
  });
  it("population count",()=>{
    const refPopCount = n => n && 1 + refPopCount(n & n-1) ;
    for ( let i=1; i<=100; i++ ) {
      const n = rnd(i*i);
      assert.equal( popCount (n), refPopCount(n) ); // JS restricted to 32-bit
    }
  });
  it("logical not",()=>{
    assert.equal( not(False) (false)(true), true );
    assert.equal( not(True)  (false)(true), false );
  });
  it("logical and",()=>{
    assert.equal( and(False)(False) (false)(true), false );
    assert.equal( and(False)(True)  (false)(true), false );
    assert.equal( and(True) (False) (false)(true), false );
    assert.equal( and(True) (True)  (false)(true), true );
  });
  it("logical or",()=>{
    assert.equal( or(False)(False) (false)(true), false );
    assert.equal( or(False)(True)  (false)(true), true );
    assert.equal( or(True) (False) (false)(true), true );
    assert.equal( or(True) (True)  (false)(true), true );
  });
  it("logical exclusive or",()=>{
    assert.equal( xor(False)(False) (false)(true), false );
    assert.equal( xor(False)(True)  (false)(true), true );
    assert.equal( xor(True) (False) (false)(true), true );
    assert.equal( xor(True) (True)  (false)(true), false );
  });
  it("logical implies",()=>{
    assert.strictEqual( implies(False)(False) (false)(true), true );
    assert.strictEqual( implies(False)(True)  (false)(true), true );
    assert.strictEqual( implies(True) (False) (false)(true), false );
    assert.strictEqual( implies(True) (True)  (false)(true), true );
  });
  it("parity",()=>{
    for ( let i=1; i<=100; i++ ) {
      const n = rnd(i*i*i);
      assert.equal( odd (fromInt(n)) (false)(true), Boolean(n&1) );
      assert.equal( even (fromInt(n)) (false)(true), ! (n&1) );
    }
  });
});
