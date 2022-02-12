import {readFileSync} from "fs";
import {assert, config as chaiConfig} from "chai";
chaiConfig.truncateThreshold = 0;

import * as LC from "../../src/lambda-calculus.js";
LC.config.purity = "LetRec";
LC.config.numEncoding = "Scott";
LC.config.verbosity = "Concise";

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
const {add,zero} = solution;

const fromInt = LC.fromIntWith(LC.config);
const toInt = LC.toIntWith(LC.config);
const fromArray = xs => xs.reduceRight( (z,x) => cons(x)(z) , nil ) ;
const toArray = foldl ( z => x => [...z,x] ) ([]) ;
const fromPair = ([fst,snd]) => Pair(fst)(snd) ;
const toPair = xy => xy ( fst => snd => [fst,snd] ) ;
const toNullable = fn => optX => optX (null) (fn) ;

const rnd = (m,n=0) => Math.random() * (n-m) + m | 0 ;
const elements = xs => xs[ rnd(xs.length) ] ;
const rndArray = size => Array.from( { length: rnd(size) }, () => rnd(size) ) ;

describe("Scott Lists",function(){
  it("nil,cons,singleton",()=>{
    assert.deepEqual( toArray( nil ), [] );
    for ( let i=1; i<=10; i++ ) {
      const x = rnd(i), xs = rndArray(i);
      assert.deepEqual( toArray( cons (fromInt(x)) (fromArray(xs.map(fromInt))) ).map(toInt), [x,...xs], `after ${ i } tests` );
      assert.deepEqual( toArray( singleton (fromInt(x)) ).map(toInt), [x], `after ${ i } tests` );
    }
  });
  it("foldr,foldl,scanr,scanl",()=>{
    for ( let i=1; i<=10; i++ ) {
      const xs = rndArray(i);
      assert.deepEqual( toInt( foldr (add) (zero) (fromArray(xs.map(fromInt))) ), xs.reduce((x,y)=>x+y,0), `after ${ i } tests` );
      assert.deepEqual( toInt( foldl (add) (zero) (fromArray(xs.map(fromInt))) ), xs.reduce((x,y)=>x+y,0), `after ${ i } tests` );
      assert.deepEqual( toArray( scanr (add) (zero) (fromArray(xs.map(fromInt))) ).map(toInt), xs.reduceRight( (z,x) => [ z[0]+x, ...z ], [0] ), `after ${ i } tests` );
      assert.deepEqual( toArray( scanl (add) (zero) (fromArray(xs.map(fromInt))) ).map(toInt), xs.reduce( (z,x) => [ ...z, z[z.length-1]+x ] , [0] ), `after ${ i } tests` );
    }
  });
  it("take,drop",()=>{
    for ( let i=1; i<=10; i++ ) {
      const n = rnd(i), xs = rndArray(i);
      assert.deepEqual( toArray( take (fromInt(n)) (fromArray(xs.map(fromInt))) ).map(toInt), xs.slice(0,n), `after ${ i } tests` );
      assert.deepEqual( toArray( drop (fromInt(n)) (fromArray(xs.map(fromInt))) ).map(toInt), xs.slice(n), `after ${ i } tests` );
    }
  });
  it("append,concat,snoc",()=>{
    for ( let i=1; i<=10; i++ ) {
      const x = rnd(i), xs = rndArray(i), ys = rndArray(i);
      assert.deepEqual( toArray( append (fromArray(xs.map(fromInt))) (fromArray(ys.map(fromInt))) ).map(toInt), [...xs,...ys], `after ${ i } tests` );
      assert.deepEqual( toArray( concat (fromArray([ fromArray(xs.map(fromInt)), fromArray(ys.map(fromInt)) ])) ).map(toInt), [...xs,...ys], `after ${ i } tests` );
      assert.deepEqual( toArray( snoc (fromArray(xs.map(fromInt))) (fromInt(x)) ).map(toInt), [...xs,x], `after ${ i } tests` );
    }
  });
  it("uncons",()=>{
    for ( let i=1; i<=10; i++ ) {
      const xs = rndArray(i);
      assert.deepEqual( toNullable ( xy => toPair(xy).map( (x,i) => i ? toArray(x).map(toInt) : toInt(x) ) ) ( uncons (fromArray(xs.map(fromInt))) ),
                        xs.length ? [ xs[0], xs.slice(1) ] : null ,
                        `after ${ i } tests` );
    }
  });
});
