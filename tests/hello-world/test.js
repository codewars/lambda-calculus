import {readFileSync} from "fs";
import {assert, config as chaiConfig} from "chai";
chaiConfig.truncateThreshold = 0;

import * as LC from "../../src/lambda-calculus.js";
LC.config.purity = "Let";
LC.config.numEncoding = "Church";

const solutionText = readFileSync(new URL("./solution.txt", import.meta.url), {encoding: "utf8"});
const {hello} = LC.compile(solutionText);

const toInt = LC.toIntWith(LC.config);

const Fst = fst => snd => fst ;
const Snd = fst => snd => snd ;

const isNil = xs => xs (Fst) (false) (true) ;
const head = xs => xs (Snd) (Fst) ;
const tail = xs => xs (Snd) (Snd) ;

// double pair encoding for list
const toString = xs => isNil (xs) ? "" : String.fromCharCode(toInt(head(xs))) + toString(tail(xs)) ;

describe("hello-world", () => {
  it("fixed test", function() {
    assert.equal( toString(hello), "Hello, world!" );
  });
});
