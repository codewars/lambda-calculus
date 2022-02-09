const {assert} = require("chai");

const LC = require("../../src/lambda-calculus.js");
LC.config.purity = "LetRec";
LC.config.numEncoding = "Scott";
LC.config.verbosity = "Concise";

const solution = LC.compile();
const fromInt = LC.fromIntWith(LC.config);
const toInt = LC.toIntWith(LC.config);

const {nil,cons,singleton} = solution;
const {foldr,head,tail,take} = solution;
const {iterate,repeat,cycle,replicate} = solution;
const {foldl,reverse} = solution;

const fromList = foldl ( z => x => [...z,x] ) ([]) ;

const refReplicate = length => x => Array.from( { length }, () => x ) ;

describe("Scott Lists",function(){
  it("example tests",()=>{
    assert.deepEqual( fromList( nil ), [] );
    assert.deepEqual( fromList( singleton ("0") ), ["0"] );
    assert.deepEqual( fromList( cons ("0") (singleton ("1")) ), ["0","1"] );
    assert.deepEqual( fromList( replicate (fromInt(0)) ("0") ), [] );
    assert.deepEqual( fromList( replicate (fromInt(1)) ("0") ), ["0"] );
    assert.deepEqual( fromList( replicate (fromInt(2)) ("0") ), ["0","0"] );
  });
  it("random tests",()=>{
    const rnd = (m,n=0) => Math.random() * (n-m) + m | 0 ;
    for ( let i=1; i<=100; i++ ) {
      const m = rnd(i), n = rnd(i);
      assert.deepEqual( fromList( replicate (fromInt(m)) (String(n)) ), refReplicate(m)(String(n)), `after ${ i } tests` );
    }
  });
});