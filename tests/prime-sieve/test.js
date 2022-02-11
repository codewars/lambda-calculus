import {readFileSync} from "fs";
import {assert, config as chaiConfig} from "chai";
chaiConfig.truncateThreshold = 0;

import * as LC from "../../src/lambda-calculus.js";
LC.config.purity = "LetRec";
LC.config.numEncoding = "BinaryScott";

const solutionText = readFileSync(new URL("./solution.txt", import.meta.url), {encoding: "utf8"});
const {primes} = LC.compile(solutionText);
const toInt = LC.toIntWith(LC.config);
const head = xs => xs ( x => xs => x ) ;
const tail = xs => xs ( x => xs => xs ) ;
const take = n => xs => n ? [ head(xs), ...take(n-1)(tail(xs)) ] : [] ;

describe("prime-sieve", () => {
  it("fixed tests: primes", function() {
    this.timeout(12e3);
    assert.equal( toInt(head(primes)), 2 );
    assert.equal( toInt(head(tail(primes))), 3 );
    assert.equal( toInt(head(tail(tail(primes)))), 5 );
    assert.equal( toInt(head(tail(tail(tail(primes))))), 7 );
    assert.deepEqual( take(100)(primes).map(toInt), [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71
                                                    ,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149
                                                    ,151,157,163,167,173,179,181,191,193,197,199,211,223,227
                                                    ,229,233,239,241,251,257,263,269,271,277,281,283,293,307
                                                    ,311,313,317,331,337,347,349,353,359,367,373,379,383,389
                                                    ,397,401,409,419,421,431,433,439,443,449,457,461,463,467
                                                    ,479,487,491,499,503,509,521,523,541
                                                    ] );
  });
});
