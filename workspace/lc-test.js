// lc-test.js

import {readFileSync} from "fs";
const read = (path) => readFileSync(new URL(path, import.meta.url), {encoding: "utf8"});

export const getSolution = () => read("./solution.lc");
export const getPreloaded = () => read("./preloaded.lc");
export const getPreloadedAndSolution = () => getPreloaded() + '\n' + getSolution() ; // this might as well check solution doesn't start with a continued line

export {assert,config} from "chai";

export * as LC from "@codewars/lambda-calculus";