/*
Lambda Calculus evaluator supporting:
  - unlimited recursion
  - fast (ish?) evaluation
  - shortform syntax

And additional features:
  - debugging aids
  - predefined encodings
  - purity modes

Written by
JohanWiltink - https://github.com/JohanWiltink
Kacarott - https://github.com/Kacarott
*/

const fs = require("fs");

// Default options
const config = new class {
  constructor() {
    this._verbosity = "Quiet";    // Calm | Concise | Loquacious | Verbose
    this._purity = "Let";         // Let | LetRec | PureLC
    this._numEncoding = "Church"; // None | Church | Scott | BinaryScott
  }
  set verbosity(val) {
    this._verbosity = val;
  }
  set purity(val) {
    this._purity = val;
  }
  set numEncoding(val) {
    this._numEncoding = val;
  }
  get verbosity() { return this._verbosity; }
  get purity() { return this._purity; }
  get numEncoding() { return this._numEncoding; }
};

function union(left, right) {
  let r = new Set(left);
  for ( const name of right ) r.add(name);
  return r;
}

class V {
  constructor(name) { this.name = name; }
  free() { return new Set([ this.name ]); }
  toString() { return this.name.toString(); }
}

class L {
  constructor(name, body) {
    this.name = name;
    this.body = body;
  }
  free() { let r = this.body.free(); r.delete(this.name); return r; }
  toString() {
    if (this.body instanceof L)
      return "\\ " + this.name + this.body.toString().slice(1);
    else
      return "\\ " + this.name + " . " + this.body.toString();
  }
}

class A {
  constructor(left, right) {
    this.left = left;
    this.right = right;
  }
  free() { return union(this.left.free(),this.right.free()); }
  toString() {
    const left = this.left instanceof L ? `(${this.left})` : this.left ;
    const right = this.right instanceof V ? this.right : `(${this.right})` ;
    return left + ' ' + right;
  }
}

function fromInt(n) {
  if ( config.numEncoding === "Church" )
    return new L("s", new L("z", Array(n).fill().reduce( s => new A(new V("s"), s), new V("z")) ));
  else if ( config.numEncoding === "Scott" )
    return new Array(n).fill().reduce( v => new L('_', new L('f', new A(new V('f'), v))), new L('z', new L('_', new V('z'))) );
  else if ( config.numEncoding === "BinaryScott" )
    return n.toString(2).replace(/^0$/,'').split("").reduce( (a,c) => new L('_', new L('f', new L('t', new A(new V( c==='1' ? 't' : 'f' ), a)))), new L('z', new L('_', new L('_', new V('z')))) );
  else if ( config.numEncoding === "None" )
    throw EvalError("This kata does not allow for number constants");
  else
    return config.numEncoding.fromInt(n); // Custom encoding
}

function toInt(term) {
  try {
    if ( config.numEncoding === "Church" )
      return term ( x => x+1 ) ( new V(0), new Map([[0,[0]]]) );
    else if ( config.numEncoding === "Scott" ) {
      let c = 0;
      while (typeof term === 'function') term = term (new V(c), new Map([[c,[c++]]])) (x=>x.term); // Hacky
      return c-1;
    } else if ( config.numEncoding === "BinaryScott" ) {
      let c = { v: '' }; // Yes, it is hacky I know.
      while ( typeof term === 'function' ) term = term ( c ) ( x => { c.v = c.v+'0'; return x.term; } ) ( x => { c.v = c.v+'1'; return x.term; } );
      return Number("0b0"+c.v.split('').reverse().join(''));
    } else if (config.numEncoding === "None") {
      return term;
    } else {
      return config.numEncoding.toInt(term);
    }
  } catch (e) {
    console.error("Term is not a number (or encoding is wrong)");
    throw EvalError("Term is not a number (or encoding is wrong)");
  }
}

function compile(code) {
  function compile(env,code) {
    function wrap(name,term) {
      const FV = term.free(); FV.delete("()");
      if ( config.purity==="Let" )
        return Array.from(FV).reduce( (tm,nm) => { if ( nm in env ) return new A( new L(nm,tm), env[nm] ); else { console.error(name,"=",term.toString()); throw new ReferenceError(`undefined free variable ${ nm }`); } } , term );
      else if ( config.purity==="LetRec" )
        return Array.from(FV).reduce( (tm,nm) => { // TODO: Figure out what this does, and tidy it
            if ( nm===name )
              return tm;
            else if ( nm in env )
              return new A( new L(nm,tm), env[nm] );
            else {
              console.error(name,"=",term.toString());
              throw new ReferenceError(`undefined free variable ${ nm }`);
            }
          }
        , FV.has(name) ? new A(new L("f",new A(new L("x",new A(new V("f"),new A(new V("x"),new V("x")))),new L("x",new A(new V("f"),new A(new V("x"),new V("x")))))),new L(name,term)) : term
        );
      else if ( config.purity==="PureLC" )
        if ( FV.size )
          { console.error(name,"=",term.toString()); throw new EvalError(`unresolvable free variable(s) ${ Array.from(FV) }: all expressions must be closed in PureLC mode`); }
        else
          return term;
      else
        throw new RangeError(`config.purity: unknown setting "${ config.purity }"`);
    }
    const letters = /[a-z]/i;
    const digits = /\d/;
    const identifierChars = /[-'\w]/;
    const whitespace = /\s/;
    function error(i,msg) {
      console.error(code);
      console.error(' '.repeat(i) + '^');
      console.error(msg + " at position " + i);
      throw new SyntaxError;
    }
    function sp(i) { while ( whitespace.test( code[i] || "" ) ) i++; return i; }
    const expect = c => function(i) { return code[i]===c ? sp(i+1) : 0 ; } ;
    function name(i) {
      if ( code[i]==='_' ) {
        while ( identifierChars.test( code[i] || "" ) ) i++;
        return [sp(i),"_"];
      } else if ( letters.test( code[i] || "" ) ) {
        let j = i+1;
        while ( identifierChars.test( code[j] || "" ) ) j++;
        const k = sp(j);
        return [k,code.slice(i,j)];
      } else
        return null;
    }
    function n(i) {
      if ( digits.test(code[i]) ) {
        let j = i+1;
        while ( digits.test(code[j]) ) j++;
        const k = sp(j);
        return [k,fromInt(Number(code.slice(i,j)))];
      } else
        return null;
    }
    function v(i) {
      const r = name(i);
      if ( r ) {
        const [j,name] = r;
        return [j,new V(name)];
      } else
        return null;
    }
    function l(i) {
      const j = expect('\\')(i);
      if ( j ) {
        let arg, args = [];
        let k = j;
        while ( arg = name(k) ) {
          [k,arg] = arg;
          args.push(arg);
        }
        if ( args.length ) {
          const l = expect('.')(k) || error(k,"lambda: expected '.'") ;
          const [m,body] = term(l) || error(l,"lambda: expected a lambda calculus term") ;
          return [ m, args.reduceRight( (body,arg) => new L(arg,body) , body ) ];
        } else
          error(k,"lambda: expected at least one named argument");
      } else
        return null;
    }
    function a(i) {
      let q, r = [];
      let j = i;
      while ( q = paren_d(term)(j) || l(j) || v(j) || n(j) ) {
        [j,q] = q;
        r.push(q);
      }
      if ( r.length )
        return [ j, r.reduce( (z,term) => new A(z,term) ) ];
      else
        return null;
    }
    const paren_d = inner => function(i) {
      const j = expect('(')(i);
      if ( j ) {
        const q = inner(j);
        if ( q ) {
          const [k,r] = q;
          const l = expect(')')(k) || error(k,"paren_d: expected ')'") ;
          return [l,r];
        } else {
          const k = expect(')')(j) || error(j,"paren_d: expected ')'") ;
          return [k,new V("()")];
        }
      } else
        return null;
    } ;
    const term = a;
    function defn(i) {
      const [j,nm] = name(i)   || error(i,"defn: expected a name") ;
      const k = expect('=')(j) || error(j,"defn: expected '='") ;
      const [l,tm] = term(k)   || error(k,"defn: expected a lambda calculus term") ;
      return [l,[nm,tm]];
    }
    const [i,r] = defn(0);
    if ( i===code.length ) {
      const [name,term] = r;
      return Object.assign( env, { [name]: wrap(name,term) } );
    } else
      error(i,"defn: incomplete parse");
  }
  const env = code.replace( /#.*$/gm, "" )
                  .replace( /\n(?=\s)/g, "" )
                  .split( '\n' )
                  .filter( term => /\S/.test(term) )
                  .reduce(compile,{})
                  ;
  for ( const [name,term] of Object.entries(env) )
    Object.defineProperty( env, name, { get() { return env._cache.has(name) ? env._cache.get(name) : env._cache.set( name, evalLC(term) ).get(name) ; } } );
  env._cache = new Map;
  const envHandler = {
    get: function (target, property) {
      // Custom undefined error when trying to access functions not defined in environment
      const result = Reflect.get(target, property);
      if (result === undefined) {
        throw ReferenceError(`${property} is not defined.`);
      } else {
        return result;
      }
    }
  }
  return new Proxy(env, envHandler);
}

function evalLC(term) {

  // builds function to return to user (representing an abstraction awaiting input)
  function awaitArg(term, stack, boundVars) {

    // callback function which will apply the input to the term
    const result = function (arg, env) {
      if (!env && arg.term && arg.env) [arg, env] = [arg.term, arg.env]; // If callback is passed another callback
      const termVal = [typeof arg !== 'number'?arg:fromInt(arg), new Map(env)];
      const newEnv = new Map(boundVars).set(term.name, termVal);
      return runEval(term.body, stack, newEnv);
    }

    // object 'methods/attributes'
    result.term = term;
    result.env = boundVars;
    result.toBool = () => result(true)(false);
    return result;
  }

  function runEval(term, stack, boundVars) { // stack: [[term, env, isRight]], boundVars = {name: [term, env]}
    while (!(term instanceof L) || stack.length > 0) {
      if (term instanceof V)
        if ( term.name==="()" )
          { console.error("eval: evaluating undefined"); throw new EvalError; }
        else
          [term, boundVars] = boundVars.get(term.name);
      else if (term instanceof A) {
        stack.push([term.right, new Map(boundVars), true]);
        term = term.left;
      } else if (term instanceof L) {
        let [lastTerm, lastEnv, isRight] = stack.pop();
        if (isRight) {
          boundVars = new Map(boundVars).set(term.name, [lastTerm, lastEnv]);
          term = term.body;
        } else { // Pass the function some other function. This might need redoing
          term = lastTerm(awaitArg(term, stack, boundVars));
        }
      } else { // Not a term
        if (stack.length == 0) return term;
        let [lastTerm, lastEnv, isRight] = stack.pop();
        if (isRight) {
          stack.push([term, new Map(boundVars), false]);
          term = lastTerm;
          boundVars = lastEnv;
        } else
          term = lastTerm(term);
      }
    }
    return awaitArg(term, stack, boundVars);
  }
  return runEval(term, [], new Map());
}

Object.defineProperty( Function.prototype, "valueOf", { value: function valueOf() { return toInt(this); } } );
Object.defineProperty( Function.prototype, "decoded", { get() { return this.valueOf(); }, enumerable: true } );

exports.config = config;
exports.compile = text => compile(text === undefined ? fs.readFileSync("./solution.txt", "utf8") : text);
exports.T = new L('a', new L('b', new V('a')));
exports.F = new L('a', new L('b', new V('b')));
exports.toInt = toInt;
