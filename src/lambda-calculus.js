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
const config = { verbosity: "Calm"      //  Calm | Concise | Loquacious | Verbose
               , purity: "Let"          //  Let | LetRec | PureLC
               , numEncoding: "Church"  //  None | Church | Scott | BinaryScott
               };

function union(left, right) {
  let r = new Set(left);
  for ( const name of right ) r.add(name);
  return r;
}

class V {
  constructor(name) { this.name = name; }
  free()            { return new Set([ this.name ]); }
  toString()        { return this.name.toString(); }
}

class L {
  constructor(name, body) {
    this.name = name;
    this.body = body;
  }
  free() {
    let r = this.body.free();
    r.delete(this.name);
    return r;
  }
  toString() {
    return this.body instanceof L
      ? `\\ ${this.name}${this.body.toString().slice(1)}`
      : `\\ ${this.name} . ${this.body.toString()}`;
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
    return `${left} ${right}`;
  }
}

const Y = new L("f",new A(new L("x",new A(new V("f"),new A(new V("x"),new V("x")))),new L("x",new A(new V("f"),new A(new V("x"),new V("x"))))));

function fromInt(n) { return fromIntWith()(n); }

function fromIntWith(cfg={}) {
  const {numEncoding,verbosity} = Object.assign( {}, config, cfg );
  return function fromInt(n) {
    if ( numEncoding === "Church" )
      if ( n >= 0 )
        return new L("s", new L("z", Array(n).fill().reduce( s => new A(new V("s"), s), new V("z")) ));
      else {
        if ( verbosity >= "Concise" ) console.error(`fromInt.Church: negative number ${ n }`);
        throw new RangeError;
      }
    else if ( numEncoding === "Scott" ) // data Int = Zero | Succ Int
      if ( n >= 0 )
        return new Array(n).fill().reduce( v => new L('_', new L('f', new A(new V('f'), v))), new L('z', new L('_', new V('z'))) );
      else {
        if ( verbosity >= "Concise" ) console.error(`fromInt.Scott: negative number ${ n }`);
        throw new RangeError;
      }
    else if ( numEncoding === "BinaryScott" ) // data Int = End | Even Int | Odd Int // LittleEndian, padding ( trailing ) 0 bits are out of spec - behaviour is undefined
      if ( n >= 0 ) {
        const zero = new L('z', new L('_', new L('_', new V('z'))));
        return n ? n.toString(2).split("").reduce( (z,bit) => new L('_', new L('f', new L('t', new A(new V( bit==='0' ? 'f' : 't' ), z)))), zero ) : zero ;
      } else {
        if ( verbosity >= "Concise" ) console.error(`fromInt.BinaryScott: negative number ${ n }`);
        throw new RangeError;
      }
    else if ( numEncoding === "None" ) {
      if ( verbosity >= "Concise" ) console.error(`fromInt.None: number ${ n }`);
      throw new EvalError;
    } else
      return numEncoding.fromInt(n); // Custom encoding
  } ;
}

function toInt(term) { return toIntWith()(term); }

function toIntWith(cfg={}) {
  const {numEncoding,verbosity} = Object.assign( {}, config, cfg );
  return function toInt(term) {
    try {
      if ( numEncoding === "Church" )
        return term ( x => x+1 ) ( new V(0), new Map([[0,[0]]]) );
      else if ( numEncoding === "Scott" ) {
        let result = 0, evaluating = true;
        while ( evaluating )
          term ( () => evaluating = false ) ( n => () => { term = n; result++ } ) ();
        return result;
      } else if ( numEncoding === "BinaryScott" ) {
        let result = 0, bit = 1, evaluating = true;
        while ( evaluating )
          term ( () => evaluating = false ) ( n => () => { term = n; bit *= 2 } ) ( n => () => { term = n; result += bit; bit *= 2 } ) ();
        return result;
      } else if (numEncoding === "None") {
        return term;
      } else {
        return numEncoding.toInt(term); // Custom encoding
      }
    } catch (e) {
      if ( verbosity >= "Concise" ) console.error(`toInt: ${ term } is not a number in numEncoding ${ numEncoding }`);
      throw e;
    }
  } ;
}

// parse :: String -> {String: Term}
function parse(code) { return parseWith()(code); }

function parseWith(cfg={}) {
  const {numEncoding,purity,verbosity} = Object.assign( {}, config, cfg );
  const fromInt = fromIntWith({numEncoding,purity,verbosity});
  return function parse(code) {
    function parseTerm(env,code) {
      function wrap(name,term) {
        const FV = term.free(); FV.delete("()");
        if ( purity === "Let" )
          return Array.from(FV).reduce( (tm,nm) => {
            if ( nm in env )
              return new A( new L(nm,tm), env[nm] );
            else {
              if ( verbosity >= "Concise" ) console.error(`parse: while defining ${ name } = ${ term }`);
              throw new ReferenceError(`undefined free variable ${ nm }`);
            }
          } , term );
        else if ( purity==="LetRec" )
          return Array.from(FV).reduce( (tm,nm) => { // this wraps terms in a snapshot of their environment at the moment of defining // TODO: tidy it
              if ( nm === name )
                return tm;
              else if ( nm in env )
                return new A( new L(nm,tm), env[nm] );
              else {
                if ( verbosity >= "Concise" ) console.error(`parse: while defining ${ name } = ${ term }`);
                throw new ReferenceError(`undefined free variable ${ nm }`);
              }
            }
          , FV.has(name) ? new A(Y,new L(name,term)) : term
          );
        else if ( purity==="PureLC" )
          if ( FV.size ) {
            if ( verbosity >= "Concise" ) console.error(`parse: while defining ${ name } = ${ term }`);
            throw new EvalError(`unresolvable free variable(s) ${ Array.from(FV) }: all expressions must be closed in PureLC mode`);
          } else
            return term;
        else
          throw new RangeError(`config.purity: unknown setting "${ purity }"`);
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
          return [sp(j),code.slice(i,j)];
        } else
          return null;
      }
      function n(i) {
        if ( digits.test(code[i]) ) {
          let j = i+1;
          while ( digits.test(code[j]) ) j++;
          return [sp(j),fromInt(Number(code.slice(i,j)))];
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
            const undefinedTerm = new V("()");
            undefinedTerm.defName = name(0)[1];
            return [k, undefinedTerm];
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
    return code.replace( /#.*$/gm, "" ) // Ignore comments
                .replace( /\n(?=\s)/g, "" )
                .split( '\n' )
                .filter( term => /\S/.test(term) )
                .reduce(parseTerm,{});
  }
}

function compile(code) { return compileWith()(code); }

function compileWith(cfg={}) {
  const {numEncoding,purity,verbosity} = Object.assign( {}, config, cfg );
  return function compile(code=fs.readFileSync("./solution.txt", "utf8")) {
    const env = parseWith({numEncoding,purity,verbosity})(code);
    for ( const [name,term] of Object.entries(env) )
      Object.defineProperty( env, name, {
        get() {
          return env._cache.has(name)
            ? env._cache.get( name )
            : env._cache.set( name, evalLC(term) ).get(name);
          }
        });
    env._cache = new Map;
    const envHandler = {
      get: function (target, property) {
        // Custom undefined error when trying to access functions not defined in environment
        const result = Reflect.get(target, property);
        if (result === undefined) {
          throw ReferenceError(`${ property } is not defined.`);
        } else {
          return result;
        }
      }
    };
    return new Proxy(env, envHandler);
  } ;
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
    } ;

    // object 'methods/attributes'
    result.term = term;
    result.env = boundVars;
    return result;
  }

  function runEval(term, stack, boundVars) { // stack: [[term, env, isRight]], boundVars = {name: [term, env]}
    while (!(term instanceof L) || stack.length > 0) {
      if (term instanceof V)
        if ( term.name==="()" )
          { console.error(`eval: evaluating undefined inside definition of "${term.defName}"`); throw new EvalError; }
        else
          [term, boundVars] = boundVars.get(term.name);
      else if (term instanceof A) {
        stack.push([term.right, new Map(boundVars), true]);
        term = term.left;
      } else if (term instanceof L) {
        let [lastTerm, lastEnv, isRight] = stack.pop();
        if (isRight) {
          if (term.name !== "_") {
            boundVars = new Map(boundVars).set(term.name, [lastTerm, lastEnv]);
          }
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
  return runEval(term, [], new Map);
}

Object.defineProperty( Function.prototype, "valueOf", { value: function valueOf() { return toInt(this); } } );

exports.config = config;
exports.compile = compile;
exports.compileWith = compileWith;
exports.fromInt = fromInt;
exports.fromIntWith = fromIntWith;
exports.toInt = toInt;
exports.toIntWith = toIntWith;
