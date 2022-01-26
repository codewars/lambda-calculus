const chai = require("chai");
const {assert} = chai;
chai.config.truncateThreshold = 0;

const LC = require("../../src/lambda-calculus.js");
LC.config.purity = "Let";
LC.config.numEncoding = "Church";

const {hello} = LC.compile();

const toInt = LC.toIntWith(LC.config);

const Fst = fst => snd => fst ;
const Snd = fst => snd => snd ;

const isNil = xs => xs (Fst) (false) (true) ;
const head = xs => xs (Snd) (Fst) ;
const tail = xs => xs (Snd) (Snd) ;

// double pair encoding for list
const toString = xs => isNil (xs) ? "" : String.fromCharCode(toInt(head(xs))) + toString(tail(xs)) ;

it("fixed test", function() {
  assert.equal( toString(hello), "Hello, world!" );
});
