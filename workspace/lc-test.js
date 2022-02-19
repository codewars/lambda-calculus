import { readFileSync } from "fs";

import { assert, config } from "chai";
import * as LC from "../src/lambda-calculus.js";

export { assert, config, LC };

const read = (path) => readFileSync(new URL(path, import.meta.url), {encoding: "utf8"});

/** Return the contents of the solution file */
export const getSolution = () => read("./solution.lc");

/** Return the contents of the optional preloaded file */
export const getPreloaded = () => read("./preloaded.lc");

/** Return the contents of the preloaded file and the solution file combined */
export const getSolutionWithPreloaded = () => getPreloaded() + "\n" + getSolution();


/** Custom assertions */

function numEql(got, exp, msg) {
  if ( got?.term && got?.env ) got = LC.toInt(got);
  if ( exp?.term && exp?.env ) exp = LC.toInt(exp);
  return this.equal(got, exp, msg);
}

Object.assign(assert, {
  numEql
});
