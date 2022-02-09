const chai = require("chai");
const {assert} = chai;

const LC = require("../../src/lambda-calculus.js");
LC.config.purity = "LetRec";
LC.config.numEncoding = "Church";

const solution = LC.compile();
const fromInt = LC.fromIntWith(LC.config);
const toInt = LC.toIntWith(LC.config);

const {B,C,I,KI,M,S,T,V,W,Y,Z} = solution;
const {True,False,not,and,or,xor,implies} = solution;
const {lt,le,eq,ge,gt} = solution;
const {zero,succ,pred,isZero} = solution;
const {plus,times,pow,minus} = solution;

const toPair = xy => [ fst(xy), snd(xy) ] ;

const rnd = (m,n=0) => Math.random() * (n-m) + m | 0 ;

describe("Church tests",function(){
  this.timeout(0);
  it("fixed tests",()=>{
    const one   = succ(zero);
    const two   = succ(one);
    const three = succ(two);
    const four  = succ(three);
    const five  = succ(four);
    assert.strictEqual( toInt(zero),  0 );
    assert.strictEqual( toInt(one),   1 );
    assert.strictEqual( toInt(two),   2 );
    assert.strictEqual( toInt(three), 3 );
    assert.strictEqual( toInt(four),  4 );
    assert.strictEqual( toInt(five),  5 );
    const n = 1e3;
    assert.strictEqual( toInt(I(fromInt(n))), n );
    assert.strictEqual( toInt(times(fromInt(1e2))(fromInt(1e1))), 1e3 );
    assert.strictEqual( toInt(pow(fromInt(10))(fromInt(3))), 1e3 );
    assert.strictEqual( toInt(pred(pow(fromInt(10))(fromInt(3)))), 1e3-1 );
  });
});