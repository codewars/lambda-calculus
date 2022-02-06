/*

Simple custom REPL for testing LC code.

Written by Kacarott
*/

const repl = require("repl");
const LC = require("./lambda-calculus.js");

// REPL defaults
LC.config.purity = "LetRec";
LC.config.numEncoding = "Church";
LC.config.verbosity = "Calm";

// State
const namespace = {};

// For prepending all predefined terms to new definitions
function prep(text) {
  for (const [name, term] of Object.entries(namespace).reverse()) {
    if (["_cache", "trace"].includes(name)) continue;
    text = `${name} = ${String(term.term)}\n${text}`;
  }
  return text;
}

// Evaluate a block of input
function acceptInput(userInput, context, filename, finish) {
  if (/^\s*$/.test(userInput)) return finish();
  if (!/=/.test(userInput)) { // evaluation, not assignment
    const {result} = LC.compile(prep("result = " + userInput));
    console.log(String(result.term))
    return finish();
  }
  const result = LC.compile(prep(userInput));
  Object.assign(namespace, result);
  return finish();
}

// Repl instance
repl.start({ prompt: "λ: ", eval: acceptInput}).context = {};
