import {readFileSync} from "fs";
import {assert, config as chaiConfig} from "chai";
chaiConfig.truncateThreshold = 0;

import * as LC from "../../src/lambda-calculus.js";
LC.configure({ purity: "Let", numEncoding: "Church" });

const solutionText = readFileSync(new URL("./solution.txt", import.meta.url), {encoding: "utf8"});
const {hello} = LC.compile(solutionText);

const Fst = fst => snd => fst ;
const Snd = fst => snd => snd ;

const isNil = xs => xs (Fst) (false) (true) ;
const head = xs => xs (Snd) (Fst) ;
const tail = xs => xs (Snd) (Snd) ;

// double pair encoding for list
const toString = xs => isNil (xs) ? "" : String.fromCharCode(LC.toInt(head(xs))) + toString(tail(xs)) ;

describe("hello-world", () => {
  it("fixed test", function() {
    LC.configure({ purity: "Let", numEncoding: "Church" });
    assert.equal( toString(hello), "Hello, world!" );
  });
});
