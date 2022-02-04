# TODO

1.  ~implement `compile = compileWith(options)` correctly~
1.  implement compiler directives
1.  add `option` to forbid compiler directives in source
1.  side effects? keywords for magic things like print to console? maybe just give `stdin` and `stdout` preloaded and inspect them afterwards?
1.  ~prettier error messages ( we already use an index into the current string for that. may be OK already )~
1.  compiler / evaluator debugging output dependent on log level

    * `Calm` should log nothing and just throw errors on failure.
    * `Concise` could log what is being compiled: the name but not the definition. do not enter into recursion.
    * `Loquacious` could then also log definitions.
    * `Verbose` could additionally log things for recursive calls. this would probably explode the amount of logging.

    `eval` can do something analogous. show exactly where any `Error` is thrown, and dump the environment at higher levels.
1.  ~tidy line 127 in src/lambda-calculus.js ( the free variables check wrapper )~
    > ~This is why I wrap terms with the environment at that moment.~

    This should get done with the redesign to terms having an environment
    
    Generally, go over, `lint` and `indent` code
1.  constants. currently all variables can not only be shadowed but also overwritten. this might mean introducing full scoping, and might not be worth it. or is it just a matter of tagging names in the environment?
1.  ~`boolEncoding` ? LC bools translate perfectly to JS choice functions; this might also not be worth it.~ not worth it
1.  Strings ( would depend on list, char _and_ number encodings; the concept seems too high level for LC )
1.  Make helper functions available, maybe as `LC.helpers` or with `#import` ( datatype en/decoders, standard combinators ). "Standard library" support, including a standard library? Can be showcased in example kata for now.
1.  Write some large kata for stress testing.
