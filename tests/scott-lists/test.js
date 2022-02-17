import {readFileSync} from "fs";
import {assert, config as chaiConfig} from "chai";
chaiConfig.truncateThreshold = 0;

import * as LC from "../../src/lambda-calculus.js";
LC.configure({ purity: "LetRec", numEncoding: "Scott", verbosity: "Concise" });

const solutionText = readFileSync(new URL("./solution.txt", import.meta.url), {encoding: "utf8"});
const solution = LC.compile(solutionText);

const {nil,cons,singleton} = solution;
const {foldr,foldl,scanr,scanl} = solution;
const {take,drop} = solution;
const {append,concat,snoc,uncons} = solution;
const {iterate,repeat,cycle,replicate,unfold} = solution;
const {head,tail,"null":isNil,length,sum,product} = solution;
const {map,"concat-map":concatMap,filter} = solution;
const {"take-while":takeWhile,"drop-while":dropWhile,"drop-while-end":dropWhileEnd} = solution;
const {"split-at":splitAt,get,set} = solution;
const {any,all,find,"find-indices":findIndices,"find-index":findIndex} = solution;
const {partition,span,"minimum-by":minimumBy,"maximum-by":maximumBy} = solution;
const {"insert-by":insertBy,"sort-by":sortBy,reverse} = solution;
const {"zip-with":zipWith,zip,unzip} = solution;
const {"group-by":groupBy,"nub-by":nubBy,"delete-by":deleteBy,"delete-firsts-by":deleteFirstsBy} = solution;
const {init,last,tails,inits,slice,transpose} = solution;
const {zero,succ,pred,add,"is-zero":isZero,Pair,None,Some} = solution;

const { fromInt, toInt } = LC;
const fromArray = xs => xs.reduceRight( (z,x) => cons(x)(z) , nil ) ;
const toArray = foldl ( z => x => [...z,x] ) ([]) ;
const fromPair = ([fst,snd]) => Pair(fst)(snd) ;
const toPair = xy => xy ( fst => snd => [fst,snd] ) ;
const fromNullable = x => x===null ? None : Some(x) ;
const toNullable = fn => optX => optX (null) (fn) ;

const rnd = (m,n=0) => Math.random() * (n-m) + m | 0 ;
const elements = xs => xs[ rnd(xs.length) ] ;
const rndArray = size => Array.from( { length: rnd(size) }, () => rnd(size) ) ;
const rndNonEmptyArray = size => Array.from( { length: rnd(size) || 1 }, () => rnd(size) ) ;

describe("Scott Lists",function(){
  it("nil,cons,singleton",()=>{
    LC.configure({ purity: "LetRec", numEncoding: "Scott", verbosity: "Concise" });
    assert.deepEqual( toArray( nil ), [] );
    for ( let i=1; i<=10; i++ ) {
      const x = rnd(i), xs = rndArray(i);
      assert.deepEqual( toArray( cons (x) (fromArray(xs)) ).map(toInt), [x,...xs], `after ${ i } tests` );
      assert.deepEqual( toArray( singleton (x) ).map(toInt), [x], `after ${ i } tests` );
    }
  });
  it("foldr,foldl,scanr,scanl",()=>{
    for ( let i=1; i<=10; i++ ) {
      const xs = rndArray(i);
      assert.equal( foldr (add) (zero) (fromArray(xs)), xs.reduce((x,y)=>x+y,0), `after ${ i } tests` );
      assert.equal( foldl (add) (zero) (fromArray(xs)), xs.reduce((x,y)=>x+y,0), `after ${ i } tests` );
      assert.deepEqual( toArray( scanr (add) (zero) (fromArray(xs)) ).map(toInt), xs.reduceRight( (z,x) => [ z[0]+x, ...z ], [0] ), `after ${ i } tests` );
      assert.deepEqual( toArray( scanl (add) (zero) (fromArray(xs)) ).map(toInt), xs.reduce( (z,x) => [ ...z, z[z.length-1]+x ] , [0] ), `after ${ i } tests` );
    }
  });
  it("take,drop",()=>{
    for ( let i=1; i<=10; i++ ) {
      const n = rnd(i), xs = rndArray(i);
      assert.deepEqual( toArray( take (n) (fromArray(xs)) ).map(toInt), xs.slice(0,n), `after ${ i } tests` );
      assert.deepEqual( toArray( drop (n) (fromArray(xs)) ).map(toInt), xs.slice(n), `after ${ i } tests` );
    }
  });
  it("append,concat,snoc",()=>{
    for ( let i=1; i<=10; i++ ) {
      const x = rnd(i), xs = rndArray(i), ys = rndArray(i);
      assert.deepEqual( toArray( append (fromArray(xs)) (fromArray(ys)) ).map(toInt), [...xs,...ys], `after ${ i } tests` );
      assert.deepEqual( toArray( concat (fromArray([ fromArray(xs), fromArray(ys) ])) ).map(toInt), [...xs,...ys], `after ${ i } tests` );
      assert.deepEqual( toArray( snoc (fromArray(xs)) (x) ).map(toInt), [...xs,x], `after ${ i } tests` );
    }
  });
  it("uncons",()=>{
    for ( let i=1; i<=10; i++ ) {
      const xs = rndArray(i);
      assert.deepEqual( toNullable ( xy => toPair(xy).map( (x,i) => i ? toArray(x).map(toInt) : toInt(x) ) ) ( uncons (fromArray(xs)) ),
                        xs.length ? [ xs[0], xs.slice(1) ] : null ,
                        `after ${ i } tests` );
    }
  });
  it("iterate",()=>{
    const N = 10;
    for ( let i=1; i<=10; i++ ) {
      const x = rnd(i), y = rnd(i);
      const actual = toArray( take (N) (iterate (add (y)) (x)) ).map(toInt);
      const expected = Array.from( { length: N }, (_,i) => x + i * y );
      assert.deepEqual( actual, expected, `after ${ i } tests` );
    }
  });
  it("repeat",()=>{
    const N = 10;
    for ( let i=1; i<=10; i++ ) {
      const x = rnd(i);
      const actual = toArray( take (N) (repeat (x)) ).map(toInt);
      const expected = Array.from( { length: N }, () => x );
      assert.deepEqual( actual, expected, `after ${ i } tests` );
    }
  });
  it("cycle",()=>{
    const N = 10;
    for ( let i=1; i<=10; i++ ) {
      const xs = rndNonEmptyArray(i);
      const actual = toArray( take (N) (cycle (fromArray(xs))) ).map(toInt);
      const expected = [].concat(...Array.from( { length: N }, () => xs )).slice(0,N);
      assert.deepEqual( actual, expected, `after ${ i } tests` );
    }
  });
  it("replicate",()=>{
    for ( let i=1; i<=10; i++ ) {
      const n = rnd(i), x = rnd(i);
      const actual = toArray( replicate (n) (x) ).map(toInt);
      const expected = Array.from( { length: n }, () => x );
      assert.deepEqual( actual, expected, `after ${ i } tests` );
    }
  });
  it("unfold",()=>{
    for ( let i=1; i<=10; i++ ) {
      const x = rnd(i);
      const actual = toArray( unfold ( x => (isZero (x)) (Some (Pair (x) (pred (x)))) (None) ) (x) ).map(toInt);
      const expected = Array.from( { length: x }, (_,i) => x-i );
      assert.deepEqual( actual, expected, `after ${ i } tests` );
    }
  });
});
