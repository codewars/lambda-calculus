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
const options = {
  "verbosity": "Quiet",    // Quiet | Concise | Loquacious | Verbose
  "purity": "Let",         // Let | LetRec | PureLC
  "numEncoding": "Church", // None | Church | Scott | BinaryScott
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
  if ( options.numEncoding === "Church" )
    return new L("s", new L("z", Array(n).fill(0).reduce( s => new A(new V("s"), s), new V("z")) ));
  else if ( options.numEncoding === "Scott" )
    return new Array(n).fill().reduce( v => new L('_', new L('f', new A(new V('f'), v))), new L('z', new L('_', new V('z'))) );
  else if ( options.numEncoding === "BinaryScott" )
    return n.toString(2).replace(/^0$/,'').split("").reduce( (a,c) => new L('_', new L('f', new L('t', new A(new V( c==='1' ? 't' : 'f' ), a)))), new L('z', new L('_', new L('_', new V('z')))) );
  else if ( options.numEncoding === "None" )
    throw EvalError("This kata does not allow for number constants");
  else
    return options.numEncoding.fromInt(n); // Custom encoding
}

function toInt(term) {
  if ( options.numEncoding === "Church" )
    return term ( x => x+1 ) ( new V(0), new Map([[0,[0]]]) );
  else if ( options.numEncoding === "Scott" ) {
    let c = 0;
    while (typeof term === 'function') term = term (new V(c), new Map([[c,[c++]]])) (x=>x.term); // Hacky
    return c-1;
  } else if ( options.numEncoding === "BinaryScott" ) {
    let c = { v: '' }; // Yes, it is hacky I know.
    while ( typeof term === 'function' ) term = term ( c ) ( x => { c.v = c.v+'0'; return x.term; } ) ( x => { c.v = c.v+'1'; return x.term; } );
    return Number("0b0"+c.v.split('').reverse().join(''));
  } else if (options.numEncoding === "None") {
    return term;
  } else {
    return options.numEncoding.toInt(term);
  }
}

function compile(code) {
  function compile(env,code) {
    function wrap(name,term) {
      const FV = term.free(); FV.delete("()");
      if ( options.purity==="Let" )
        return Array.from(FV).reduce( (term,name) => new A( new L(name,term), env[name] ) , term );
      else if ( options.purity==="LetRec" )
        return Array.from(FV).reduce( (term,name) => new A( new L(name,term), env[name] )
                                    , FV.has(name) ? new A(new L("f",new A(new L("x",new A(new V("f"),new A(new V("x"),new V("x")))),new L("x",new A(new V("f"),new A(new V("x"),new V("x")))))),new L(name,term)) : term
                                    );
      else if ( options.purity==="PureLC" )
        if ( FV.size )
          throw new EvalError(`compile: free variable(s) ${ FV } cannot be resolved in definition ${ name }. All solution definitions must be closed expressions in PureLC mode.`);
        else
          return term;
      else
        throw new RangeError(`config.purity: unknown setting "${ options.purity }"`);
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
      const r = name(i) ;
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
      const [j,name_] = name(i) || error(i,"defn: expected a name") ;
      const k = expect('=')(j)  || error(j,"defn: expected '='") ;
      const [l,term_] = term(k) || error(k,"defn: expected a lambda calculus term") ;
      return [l,[name_,term_]];
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
    Object.defineProperty( env, name, { get() { return env.cache.has(name) ? env.cache.get(name) : env.cache.set( name, evalLC(term) ).get(name) ; } } );
  env.cache = new Map;
  return env;
}

function evalLC(term) {
  function runEval(term, stack, boundVars) { // stack: [[term, env, isRight]], boundVars = {name: [term, env]}
    while (!(term instanceof L) || stack.length > 0) {
      if (term instanceof V)
        if ( term.name==="()" ) {
          console.error("eval: evaluating undefined");
          throw new EvalError();
        } else
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
          const awaitArg = (arg, env) => runEval(term.body, stack, new Map(boundVars).set(term.name, [typeof arg !== 'number'?arg:fromInt(arg), new Map(env)]));
          awaitArg.term = term;
          awaitArg.env = boundVars;
          awaitArg.toInt = () => toInt(awaitArg);
          awaitArg.valueOf = () => { return toInt(awaitArg); }
          term = lastTerm(awaitArg);
        }
      } else { // Not a term
        if (stack.length == 0) return term;
        let [lastTerm, lastEnv, isRight] = stack.pop();
        if (isRight) {
          stack.push([term, new Map(boundVars), false]);
          term = lastTerm;
          boundVars = lastEnv; }
        else term = lastTerm(term);
      }
    }
    const awaitArg = (arg, env) => runEval(term.body, stack, new Map(boundVars).set(term.name, [typeof arg !== 'number'?arg:fromInt(arg), new Map(env)]));
    awaitArg.term = term;
    awaitArg.env = boundVars;
    return awaitArg;
  }
  return runEval(term, [], new Map());
}

Object.defineProperty( Function.prototype, "valueOf", { value: function valueOf() { return toInt(this); } } );
Object.defineProperty( Function.prototype, "decoded", { get() { return this.valueOf(); }, enumerable: true } );

exports.config = options;
exports.compile = text => compile(text === undefined ? fs.readFileSync("./solution.txt", "utf8") : text);
exports.T = new L('a', new L('b', new V('a')));
exports.F = new L('a', new L('b', new V('b')));
exports.toInt = toInt;
