import {readFileSync} from "fs";
import {assert} from "chai";

import * as LC from "../../src/lambda-calculus.js";
LC.configure({ purity: "LetRec", numEncoding: "Church" });

const solutionText = readFileSync(new URL("./solution.txt", import.meta.url), {encoding: "utf8"});
const solution = LC.compile(solutionText);
const { fromInt, toInt } = LC;

const {B,C,I,KI,M,S,T,V,W,Y,Z} = solution;
const {True,False,not,and,or,xor,implies} = solution;
const {lt,le,eq,ge,gt} = solution;
const {zero,succ,pred,isZero} = solution;
const {plus,times,pow,minus} = solution;

const rnd = (m,n=0) => Math.random() * (n-m) + m | 0 ;

describe("Church tests",function(){
  this.timeout(0);
  it("fixed tests",()=>{
    LC.configure({ purity: "LetRec", numEncoding: "Church" });
    const one   = succ(zero);
    const two   = succ(one);
    const three = succ(two);
    const four  = succ(three);
    const five  = succ(four);
    assert.equal( zero,  0 );
    assert.equal( one,   1 );
    assert.equal( two,   2 );
    assert.equal( three, 3 );
    assert.equal( four,  4 );
    assert.equal( five,  5 );
    const n = 1e3;
    assert.equal( I(fromInt(n)), n );
    assert.equal( times(1e2)(1e1), 1e3 );
    assert.equal( pow(10)(3), 1e3 );
    assert.equal( pred(pow(10)(3)), 1e3-1 );
    assert.equal( pow(0)(0), 1);
  });
});
