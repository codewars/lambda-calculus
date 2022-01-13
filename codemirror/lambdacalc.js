// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

// Lambda Calculus Mode written by Keldan Chapman (Kacarott on CodeWars)

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("lambdacalc", function(_config, modeConfig) {

  // Modes for different types of symbols
  const DEFNAME = "builtin";
  const EQUALS = "text";
  const BRACKETS = "bracket";
  const LAMBDA = "atom";
  const DOT = LAMBDA;
  const PREDEF = "text";
  const BOUND = "text";
  const ARGS = "variable";
  const HOLE = "variable-2";
  const NUMBER = "number";
  const EMPTY = "variable-3";
  const UNDEF = "error";
  const REDEF = "error";
  const FAIL = "error";

  const defName = /[a-zA-Z][a-zA-Z0-9_\-']*/
  const assign = /=/
  const brack = /\(|\)/
  const lamArg = /[a-zA-Z_][a-zA-Z0-9_\-']*|\./
  const numconst = /\d+/

  function expectDef(stream, state) {
    const name = (stream.match(defName)||[])[0];
    state.f = expectAssign;
    if (!name || !(/[=\s]/.test(stream.peek()) || stream.eol())) return null;
    const res = [];
    if (state.defined.includes(name)) res.push(REDEF);
    state.defined.push(name);
    res.push(DEFNAME);
    return res.join(" ");
  }

  function expectAssign(stream, state) {
    if (!stream.match(assign)) return null;
    state.f = expectTerm;
    return EQUALS;
  }

  function expectTerm(stream, state) {
    return brackets(stream, state)
     || lambda(stream, state)
     || namedTerm(stream, state)
     || number(stream, state);
  }

  function brackets(stream, state) {
    const v = stream.eat(brack);
    if (!v) return null;
    if (v == '(' && stream.peek() == ')') {
      stream.next();
      return EMPTY;
    }
    if (v == '(') {
      state.depth.push(stream.column() + stream.indentation());
      state.bound.push([]);
    }
    else {
      state.depth.pop();
      state.bound.pop();
    }
    return BRACKETS;
  }

  function lambda(stream, state) {
    if (!stream.eat("\\")) return null;
    state.f = expectArg;
    return LAMBDA;
  }

  function namedTerm(stream, state) {
    const res = (stream.match(defName)||[])[0];
    if (!res) return null;
    if (state.bound.some(v=>v.includes(res))) return BOUND;
    if (state.defined.includes(res)) return PREDEF;
    return UNDEF;
  }

  function number(stream, state) {
    const num = (stream.match(numconst)||[])[0];
    return num && (/\s|\)/.test(stream.peek()) || stream.eol()) ? NUMBER : null;
  }

  function expectArg(stream, state) {
    const arg = (stream.match(lamArg)||[])[0];
    if (!arg) return null;
    if (arg === '.') {
      state.f = expectTerm;
      return DOT;
    }
    if (arg[0] === '_') return HOLE;
    state.bound[state.bound.length-1].push(arg);
    return ARGS;
  }

  function onFail(stream, state) {
    stream.match(/[^\s]*/);
    return FAIL
  }

  return {
    startState: function ()  { return {
      f: expectDef,
      depth: [],
      defined: [],
      bound: [[]]
    }; },
    copyState:  function (s) { return {
      f: s.f,
      depth: [...s.depth],
      defined: [...s.defined],
      bound: s.bound.map(v=>[...v])
    }; },

    token: function(stream, state) {
      if (/\s/.test(stream.peek())) {
        stream.eatSpace();
        return;
      }
      if (stream.peek() === '#') {
        stream.skipToEnd();
        return "comment"
      }
      if (stream.sol() && state.depth.length === 0) {
        state.bound = [[]];
        state.f = expectDef;
      }
      return state.f(stream, state) || onFail(stream, state);
    },

    indent: function(state, textAfter) {
      console.log(state.depth);
      if (!state.depth.length) return 0;
      return state.depth[state.depth.length-1] + 2;
    },
    lineComment: "#",
  };

});

CodeMirror.defineMIME("text/x-lambdacalc", "lambdacalculus");

});
