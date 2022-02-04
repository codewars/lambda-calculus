const chai = require("chai");
const {assert} = chai;

const LC = require("../../src/lambda-calculus.js");
LC.config.purity = "LetRec";
LC.config.numEncoding = "BinaryScott";
LC.config.verbosity = "Concise";

const solution = LC.compile();
const fromInt = LC.fromIntWith(LC.config);
const toInt = LC.toIntWith(LC.config);

const {False,True,not,and,or,xor,implies} = solution;
const {LT,EQ,GT,compare,lt,le,eq,ge,gt} = solution;
const {Pair,fst,snd,first,second,both,bimap,curry} = solution;
const {zero,shiftR0,shiftR1,shiftL,isStrictZero,isZero,pad,unpad,isPadded} = solution;
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
    const one   = succ(zero)
    const two   = succ(one)
    const three = succ(two)
    const four  = succ(three)
    const five  = succ(four)
    assert.strictEqual( toString(zero), "$" );
    assert.strictEqual( toString(one), "1$" );
    assert.strictEqual( toString(two), "01$" );
    assert.strictEqual( toString(three), "11$" );
    assert.strictEqual( toString(four), "001$" );
    assert.strictEqual( toString(five), "101$" );
    assert.strictEqual( toString(five), "101$" );
    assert.strictEqual( toString(pred(five)), "001$" );
    assert.strictEqual( toString(unpad(pred(pred(five)))), "11$" );
    assert.strictEqual( toString(unpad(pred(pred(pred(five))))), "01$" );
    assert.strictEqual( toString(unpad(pred(pred(pred(pred(five)))))), "1$" );
    assert.strictEqual( toString(unpad(pred(pred(pred(pred(pred(five))))))), "$" );
  });
  it("successor",()=>{
    let n = zero;
    for ( let i=1; i<=100; i++ ) {
      n = succ (n);
      if ( LC.config.verbosity >= "Loquacious" ) console.log(`${ i } <- ${ toString(n) }`);
      assert.strictEqual( toInt(n), i );
    }
  });
  it("predecessor",()=>{
    let n = fromInt(100);
    for ( let i=100; i--; ) {
      n = pred (n);
      if ( LC.config.verbosity >= "Loquacious" ) console.log(`${ i } <- ${ toString(n) }`);
      assert.strictEqual( toInt(n), i );
    }
  });
  it("predecessor robustness",()=>{
    if ( LC.config.verbosity >= "Loquacious" ) console.log(`pred 01$ -> 1$`);
    assert.strictEqual( toString( pred ( fromInt(2) ) ), "1$" );
    if ( LC.config.verbosity >= "Loquacious" ) console.log(`pred $ -> $`);
    assert.strictEqual( toString( pred ( end => even => odd => end ) ), "$" );
    if ( LC.config.verbosity >= "Loquacious" ) console.log(`pred 0$ -> $`);
    assert.strictEqual( toString( pred ( end => even => odd => even (
                                         end => even => odd => end ) ) ), "$" );
    if ( LC.config.verbosity >= "Loquacious" ) console.log(`pred 00$ -> $`);
    assert.strictEqual( toString( pred ( end => even => odd => even (
                                         end => even => odd => even (
                                         end => even => odd => end ) ) ) ), "$" );
  });
  it("ordering",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i*i), n = rnd(i*i);
      if ( LC.config.verbosity >= "Loquacious" )  console.log(`compare ${ m } ${ n }`);
      assert.strictEqual( compare (fromInt(m)) (fromInt(n)) ("-1") ("0") ("1"), String(Number(m>n) - Number(m<n)) );
    }
  });
  it("comparison",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i*i), n = rnd(i*i);
      if ( LC.config.verbosity >= "Loquacious" ) console.log(`compare ${ m } ${ n }`);
      assert.strictEqual( lt (fromInt(m)) (fromInt(n)) (false)(true), m < n );
      assert.strictEqual( le (fromInt(m)) (fromInt(n)) (false)(true), m <= n );
      assert.strictEqual( eq (fromInt(m)) (fromInt(n)) (false)(true), m == n );
      assert.strictEqual( ge (fromInt(m)) (fromInt(n)) (false)(true), m >= n );
      assert.strictEqual( gt (fromInt(m)) (fromInt(n)) (false)(true), m > n );
      assert.strictEqual( eq (fromInt(m)) (fromInt(m)) (false)(true), true );
    }
  });
  it("addition",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i*i), n = rnd(i*i);
      if ( LC.config.verbosity >= "Loquacious" ) console.log(`${ m } + ${ n } = ${ m+n }`);
      assert.strictEqual( toInt( plus (fromInt(m)) (fromInt(n)) ), m + n );
    }
  });
  it("multiplication",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i*i), n = rnd(i*i);
      if ( LC.config.verbosity >= "Loquacious" ) console.log(`${ m } * ${ n } = ${ m*n }`);
      assert.strictEqual( toInt( times (fromInt(m)) (fromInt(n)) ), m * n );
    }
  });
  it("subtraction",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i*i), n = rnd(i*i);
      if ( LC.config.verbosity >= "Loquacious" ) console.log(`subtract ${ m } ${ n }`);
      assert.strictEqual( toInt( minus (fromInt(m)) (fromInt(n)) ), Math.max( 0, m - n ) );
      assert.strictEqual( toInt( minus (fromInt(n)) (fromInt(m)) ), Math.max( 0, n - m ) );
    }
  });
  it("division",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i*i), n = rnd(i*i);
      if ( LC.config.verbosity >= "Loquacious" ) console.log(`division ${ m } ${ n }`);
      assert.deepEqual( toPair( divMod (fromInt(m)) (fromInt(n||1)) ).map(toInt), [ m/(n||1)|0, m%(n||1) ] );
      assert.deepEqual( toPair( divMod (fromInt(n)) (fromInt(m||1)) ).map(toInt), [ n/(m||1)|0, n%(m||1) ] );
    }
  });
  it("exponentiation",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i), n = rnd(i%10);
      if ( LC.config.verbosity >= "Loquacious" ) console.log(`${ m } ** ${ n } = ${ m**n }`);
      assert.strictEqual( toInt( pow (fromInt(m)) (fromInt(n)) ), m ** n );
    }
  });
  it("greatest common divisor",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i), n = rnd(i);
      if ( LC.config.verbosity >= "Loquacious" ) console.log(`gcd ${ m } ${ n } = ${ refGCD(m)(n) }`);
      assert.strictEqual( toInt( gcd (fromInt(m)) (fromInt(n)) ), refGCD(m)(n) );
    }
  });
  it("least common multiple",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i), n = rnd(i);
      if ( LC.config.verbosity >= "Loquacious" ) console.log(`lcm ${ m } ${ n } = ${ m/(refGCD(m)(n)||1)*n }`);
      assert.strictEqual( toInt( lcm (fromInt(m)) (fromInt(n)) ), m / (refGCD(m)(n)||1) * n );
    }
  });
  it("minimum",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i*i), n = rnd(i*i);
      if ( LC.config.verbosity >= "Loquacious" ) console.log(`min ${ m } ${ n } = ${ Math.min(m,n) }`);
      assert.strictEqual( toInt( min (fromInt(m)) (fromInt(n)) ), Math.min(m,n) );
    }
  });
  it("maximum",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i*i), n = rnd(i*i);
      if ( LC.config.verbosity >= "Loquacious" ) console.log(`max ${ m } + ${ n } = ${ Math.max(m,n) }`);
      assert.strictEqual( toInt( max (fromInt(m)) (fromInt(n)) ), Math.max(m,n) );
    }
  });
  it("shifting bits",()=>{
    for ( let i=1; i<=100; i++ ) {
      const n = rnd(i*i);
      if ( LC.config.verbosity >= "Loquacious" ) console.log(`shift ${ n }`);
      assert.strictEqual( toInt( shiftL (fromInt(n)) ), n >> 1 );
      assert.strictEqual( toInt( shiftR0 (fromInt(n)) ), n << 1 );
      assert.strictEqual( toInt( shiftR1 (fromInt(n)) ), n << 1 | 1 );
    }
  });
  it("zero padding",()=>{
    for ( let i=1; i<=100; i++ ) {
      const n = rnd(i*i);
      if ( LC.config.verbosity >= "Loquacious" ) console.log(`isPadded ${ n }`);
      assert.strictEqual( isPadded (fromInt(n)) (false)(true), false );
      assert.strictEqual( isPadded (pad(fromInt(n))) (false)(true), true );
      assert.strictEqual( isPadded (pad(pad(fromInt(n)))) (false)(true), true );
      assert.strictEqual( isPadded (pad(pad(pad(fromInt(n))))) (false)(true), true );
    }
  });
  it("bitwise and",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i*i), n = rnd(i*i);
      if ( LC.config.verbosity >= "Loquacious" ) console.log(`${ m } & ${ n } = ${ m&n }`);
      assert.strictEqual( toInt( bitAnd (fromInt(m)) (fromInt(n)) ), m & n );
    }
  });
  it("bitwise or",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i*i), n = rnd(i*i);
      if ( LC.config.verbosity >= "Loquacious" ) console.log(`${ m } | ${ n } = ${ m|n }`);
      assert.strictEqual( toInt( bitOr (fromInt(m)) (fromInt(n)) ), m | n );
    }
  });
  it("bitwise exclusive or",()=>{
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i*i), n = rnd(i*i);
      if ( LC.config.verbosity >= "Loquacious" ) console.log(`${ m } ^ ${ n } = ${ m^n }`);
      assert.strictEqual( toInt( bitXor (fromInt(m)) (fromInt(n)) ), m ^ n );
    }
  });
  it("testing bits",()=>{
    for ( let i=1; i<=100; i++ ) {
      const j = rnd(i%32), n = rnd(i*i);
      if ( LC.config.verbosity >= "Loquacious" ) console.log(`testBit ${ j } ${ n } = ${ Boolean( n & 1<<j ) }`);
      assert.strictEqual( testBit (fromInt(j)) (fromInt(n)) (false)(true), Boolean( n & 1<<j ) ); // JS restricted to 32-bit
    }
  });
  it("setting bits",()=>{
    for ( let i=1; i<=100; i++ ) {
      const j = rnd(i%32);
      if ( LC.config.verbosity >= "Loquacious" ) console.log(`bit ${ j } = ${ 1<<j }`);
      assert.strictEqual( toInt( bit (fromInt(j)) ), 1<<j ); // JS restricted to 32-bit
    }
  });
  it("population count",()=>{
    const refPopCount = n => n && 1 + refPopCount(n & n-1) ;
    for ( let i=1; i<=100; i++ ) {
      const n = rnd(i*i);
      if ( LC.config.verbosity >= "Loquacious" ) console.log(`popCount ${ n } = ${ refPopCount(n) }`);
      assert.strictEqual( toInt( popCount (fromInt(n)) ), refPopCount(n) ); // JS restricted to 32-bit
    }
  });
  it("logical not",()=>{
    assert.strictEqual( not(False) (false)(true), true );
    assert.strictEqual( not(True)  (false)(true), false );
  });
  it("logical and",()=>{
    assert.strictEqual( and(False)(False) (false)(true), false );
    assert.strictEqual( and(False)(True)  (false)(true), false );
    assert.strictEqual( and(True) (False) (false)(true), false );
    assert.strictEqual( and(True) (True)  (false)(true), true );
  });
  it("logical or",()=>{
    assert.strictEqual( or(False)(False) (false)(true), false );
    assert.strictEqual( or(False)(True)  (false)(true), true );
    assert.strictEqual( or(True) (False) (false)(true), true );
    assert.strictEqual( or(True) (True)  (false)(true), true );
  });
  it("logical exclusive or",()=>{
    assert.strictEqual( xor(False)(False) (false)(true), false );
    assert.strictEqual( xor(False)(True)  (false)(true), true );
    assert.strictEqual( xor(True) (False) (false)(true), true );
    assert.strictEqual( xor(True) (True)  (false)(true), false );
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
      if ( LC.config.verbosity >= "Loquacious" ) console.log(`parity ${ n }`);
      assert.strictEqual( odd (fromInt(n)) (false)(true), Boolean(n&1) );
      assert.strictEqual( even (fromInt(n)) (false)(true), ! (n&1) );
    }
  });
});