import { readFileSync } from "fs";

export { assert, config } from "chai";
export * as LC from "@codewars/lambda-calculus";

const read = (path) => readFileSync(new URL(path, import.meta.url), {encoding: "utf8"});

/** Return the contents of the solution file */
export const getSolution = () => read("./solution.lc");

/** Return the contents of the optional preloaded file */
export const getPreloaded = () => read("./preloaded.lc");

/** Return the contents of the preloaded file and the solution file combined */
export const getSolutionWithPreloaded = () => getPreloaded() + "\n" + getSolution();
