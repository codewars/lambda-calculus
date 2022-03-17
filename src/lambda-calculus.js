/*
Lambda Calculus evaluator supporting:
  - unlimited recursion
  - call by need
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

// Default options
const config = { verbosity: "Calm"    //  Calm | Concise | Loquacious | Verbose
               , purity: "PureLC"     //  Let | LetRec | PureLC
               , numEncoding: "None"  //  None | Church | Scott | BinaryScott
               };

export function configure(cfg={}) { return Object.assign(config,cfg); }

function union(left, right) {
  const r = new Set(left);
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
    const r = this.body.free();
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

class Env extends Map {
  // use inherited set, get for copying references
  // insert and retrieve values with setThunk and getValue
  // encoding of value is a Generator Object that yields value forever - this is opaque
  setThunk(i,val) {
    this.set(i, function*() {
      // console.warn(`expensively calculating ${ i }`);
      const result = (yield val) ?? val; // If val is not A or V, then it need not be evaluated
      while ( true ) yield result;
    } () );
    return this;
  }
  // Second argument provides an interface for storing the evaluated term inside
  // the generator, for future accesses.
  getValue(i, result) {
    // console.warn(`inexpensively  fetching ${ i }`);
    return this.get(i).next(result).value;
  }
}

// Term and Env pair, used internally to keep track of current computation in eval
class Tuple {
  constructor(term,env) { Object.assign(this,{term,env}); }
  valueOf() { return toInt(this.term); }
  toString() { return this.term.toString(); }
}

// Used to insert an external (JS) value into evaluation manually ( avoiding implicit number conversion )
function Primitive(v) { return new Tuple(new V( "<primitive>" ), new Env([[ "<primitive>" , function*() { while ( true ) yield v; } () ]])); }

const primitives = new Env;
primitives.setThunk( "trace", new Tuple( Primitive( function(v) { console.info(String(v.term)); return v; } ), new Env ) );

const Y = new L("f",new A(new L("x",new A(new V("f"),new A(new V("x"),new V("x")))),new L("x",new A(new V("f"),new A(new V("x"),new V("x"))))));

export function fromInt(n) {
  if ( config.numEncoding === "Church" )
    if ( n >= 0 )
      return new L("s", new L("z", Array(n).fill().reduce( s => new A(new V("s"), s), new V("z")) ));
    else {
      if ( config.verbosity >= "Concise" ) console.error(`fromInt.Church: negative number ${ n }`);
      throw new RangeError;
    }
  else if ( config.numEncoding === "Scott" ) // data Int = Zero | Succ Int
    if ( n >= 0 )
      return new Array(n).fill().reduce( v => new L('_', new L('f', new A(new V('f'), v))), new L('z', new L('_', new V('z'))) );
    else {
      if ( config.verbosity >= "Concise" ) console.error(`fromInt.Scott: negative number ${ n }`);
      throw new RangeError;
    }
  else if ( config.numEncoding === "BinaryScott" ) // data Int = End | Even Int | Odd Int // LittleEndian, padding ( trailing ) 0 bits are out of spec - behaviour is undefined
    if ( n >= 0 ) {
      const zero = new L('z', new L('_', new L('_', new V('z'))));
      return n ? n.toString(2).split("").reduce( (z,bit) => new L('_', new L('f', new L('t', new A(new V( bit==='0' ? 'f' : 't' ), z)))), zero ) : zero ;
    } else {
      if ( config.verbosity >= "Concise" ) console.error(`fromInt.BinaryScott: negative number ${ n }`);
      throw new RangeError;
    }
  else if ( config.numEncoding === "None" ) {
    if ( config.verbosity >= "Concise" ) console.error(`fromInt.None: number ${ n }`);
    throw new EvalError;
  } else
    return config.numEncoding.fromInt(n); // Custom encoding
}

export function toInt(term) {
  try {
    if ( config.numEncoding === "Church" ) {
      const succ = x => x+1 ;
      const result = term ( succ ) ;
      return result ( result === succ ? 0 : Primitive(0) );
    } else if ( config.numEncoding === "Scott" ) {
      let result = 0, evaluating = true;
      while ( evaluating )
        term ( () => evaluating = false ) ( n => () => { term = n; result++ } ) ();
      return result;
    } else if ( config.numEncoding === "BinaryScott" ) {
      let result = 0, bit = 1, evaluating = true;
      while ( evaluating )
        term ( () => evaluating = false ) ( n => () => { term = n; bit *= 2 } ) ( n => () => { term = n; result += bit; bit *= 2 } ) ();
      return result;
    } else if ( config.numEncoding === "None" )
      return term;
    else
      return config.numEncoding.toInt(term); // Custom encoding
  } catch (e) {
    if ( config.verbosity >= "Concise" ) console.error(`toInt: ${ term } is not a number in numEncoding ${ config.numEncoding }`);
    throw e;
  }
}

// parse :: String -> Env { String => Term }
function parse(code) {
  function parseTerm(env,code) {
    function wrap(name,term) {
      const FV = term.free(); FV.delete("()");
      if ( config.purity === "Let" )
        return Array.from(FV).reduce( (tm,nm) => {
          if ( env.has(nm) ) {
            if ( config.verbosity >= "Verbose" ) console.debug(`   using ${ nm } = ${ env.getValue(nm) }`);
            tm.env.set( nm, env.get(nm) );
            return tm;
          } else {
            if ( config.verbosity >= "Concise" ) console.error(`parse: while defining ${ name } = ${ term }`);
            if ( nm === name )
              throw new ReferenceError(`undefined free variable ${ nm }: direct recursive calls are not supported in Let mode`);
            else
              throw new ReferenceError(`undefined free variable ${ nm }`);
          }
        } , new Tuple( term, new Env ) );
      else if ( config.purity==="LetRec" )
        return Array.from(FV).reduce( (tm,nm) => {
          if ( nm === name )
            return tm;
          else if ( env.has(nm) ) {
            if ( config.verbosity >= "Verbose" ) console.debug(`   using ${ nm } = ${ env.getValue(nm) }`);
            tm.env.set( nm, env.get(nm) );
            return tm;
          } else {
            if ( config.verbosity >= "Concise" ) console.error(`parse: while defining ${ name } = ${ term }`);
            throw new ReferenceError(`undefined free variable ${ nm }`);
          }
        } , new Tuple( FV.has(name) ? new A(Y,new L(name,term)) : term , new Env ) );
      else if ( config.purity==="PureLC" )
        if ( FV.size ) {
          if ( config.verbosity >= "Concise" ) console.error(`parse: while defining ${ name } = ${ term }`);
          throw new EvalError(`unresolvable free variable(s) ${ Array.from(FV) }: all expressions must be closed in PureLC mode`);
        } else
          return new Tuple( term, new Env );
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
      throw new SyntaxError(msg);
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
        const [j,termName] = r;
        if ( termName==="_" ) {
          const undef = new V("()");
          undef.defName = name(0)[1];
          return [j,undef];
        } else
          return [j,new V(termName)];
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
      if ( config.verbosity >= "Loquacious" )
        console.debug(`compiled ${ name }${ config.verbosity >= "Verbose" ? ` = ${ term }` : "" }`);
      return env.setThunk( name, wrap(name,term));
    } else
      error(i,"defn: incomplete parse");
  }
  return code.replace( /#.*$/gm, "" )                  // ignore comments
              .replace( /\n(?=\s)/g, "" )              // continue lines
              .split( '\n' )                           // split lines
              .filter( term => /\S/.test(term) )       // skip empty lines
              .reduce(parseTerm, new Env(primitives)); // parse lines
}

export function compile(code) {
  if ( typeof code !== "string" || ! code ) throw new TypeError("missing code");
  const env = parse(code);
  const r = {};
  for ( const [name] of env )
    Object.defineProperty( r, name, { get() { return evalLC(new Tuple(new V(name), env)); }, enumerable: true } );
  return r;
}

// Top level call, term :: Tuple
function evalLC(term) {

  // builds function to return to user ( representing an abstraction awaiting input )
  function awaitArg(term, stack, env) {
    // callback function which will evaluate term.body in an env with the input
    function result(arg) {
      let argEnv;
      if ( arg?.term && arg?.env ) ({ term: arg, env: argEnv } = arg); // if callback is passed another callback, or a term
      const termVal = new Tuple( typeof arg === 'number' ? fromInt(arg) : arg , new Env(argEnv) );
      if ( term.name==="_" )
        return runEval( new Tuple(term.body, new Env(env)), stack );
      else
        return runEval( new Tuple(term.body, new Env(env).setThunk(term.name, termVal)), stack );
    }
    return Object.assign( result, {term,env} );
  }

  // term :: Tuple
  // isRight :: bool (indicating whether the term is left or right side of an Application)
  // isEvaluated :: bool (indicating whether the current term should be stored in the Env)
  // callstack :: [String] (History of var lookups, for better error messages)
  function runEval({term,env},stack) { // stack: [[term, isRight, isEvaluated]], term: LC term, env = Env { name => term }
    const callstack = []; // Does not persist between requests for arguments
    while ( ! ( term instanceof L ) || stack.length > 0 ) {
      if ( term instanceof V )
        if ( term.name==="()" )
          { printStackTrace("eval: evaluating undefined", term, callstack); throw new EvalError; }
        else {
          callstack.push(term.name);
          const res = env.getValue(term.name);
          if ( ! res.env )
            term = res;
          else {
            if (res.term instanceof V || res.term instanceof A)
              // Push a frame to the stack to indicate when the value should be stored back
              stack.push( [new Tuple( term, env ), false, true ] );
            ({term, env} = res);
          }
        }
      else if ( term instanceof A ) {
        stack.push([ new Tuple(term.right, new Env(env)), true ]);
        term = term.left;
      } else if ( term instanceof L ) {
        const [ { term: lastTerm, env: lastEnv }, isRight, isEvaluated ] = stack.pop();
        if ( isEvaluated ) {
          // A non-evaluated term was received from an Env, but it is now evaluated.
          // Store it.
          lastEnv.getValue(lastTerm.name, new Tuple(term, env));
        } else if ( isRight ) {
          if ( term.name !== "_" )
            env = new Env(env).setThunk(term.name, new Tuple(lastTerm, lastEnv));
          term = term.body;
        } else { // Pass the function some other function.
          term = lastTerm(awaitArg(term, [], env));
        }
      } else if ( term instanceof Tuple ) {
        // for primitives
        ({term, env} = term);
      } else { // Not a term
        if ( stack.length === 0 ) return term;
        const [ { term: lastTerm, env: lastEnv }, isRight, isEvaluated ] = stack.pop();
        if ( isEvaluated ) {
          // A non-evaluated term was received from an Env, but it is now evaluated.
          // Store it.
          lastEnv.getValue(lastTerm.name, new Tuple(term, env));
        } else if ( isRight ) {
          stack.push([ new Tuple(term, new Env(env)), false ]);
          term = lastTerm;
          env = lastEnv;
        } else { // lastTerm is a JS function
          const res = lastTerm(term);
          if ( res.term ) {
            ({term, env} = res);
            if ( ! env ) env = new Env;
          } else
            term = res;
        }
      }
    }
    // We need input
    return awaitArg(term, stack, env);
  }
  return runEval(term, []);
}

// Print an error, with stack trace according to verbosity level
function printStackTrace(error, term, stack) {
  if ( config.verbosity >= "Concise" )
    console.error(`${ error } inside definition of ${ term.defName }`);

  const stackCutoff = config.verbosity < "Verbose" && stack[stack.length-1] == term.defName ? stack.indexOf(term.defName) + 1 : 0 ;

  if ( config.verbosity >= "Loquacious" )
    console.error( stack.slice(stackCutoff).reverse().map( v => `\twhile evaluating ${ v }`).join('\n') );
}

Object.defineProperty( Function.prototype, "valueOf", { value: function valueOf() { if (this.term) return toInt(this); else return this; } } );
