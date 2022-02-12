import { readFileSync } from "fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), {encoding: "utf8"});

/** Return the contents of the solution file */
export const solution = () => read("./solution.lc");

/** Return the contents of the optional preloaded file */
export const preloaded = () => read("./preloaded.lc");
