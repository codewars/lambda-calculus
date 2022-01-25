# TODO

1. implement `compile = compileWith(options)` correctly
1. implement compiler directives
1. add `option` to forbid compiler directives in source
1. side effects? keywords for magic things like print to console? maybe just give `stdin` and `stdout` preloaded?
1. better error messages ( don't we actually already have an index into the current string for that? )
1. compiler debugging output dependent on log level
1. tidy line 127 in src/lambda-calculus.js ( the free variables check wrapper )
    > This is why I wrap terms with the environment at that moment.
1. constants. currently all variables can not only be shadowed but also overwritten. this might mean introducing full scoping, and might not be worth it.
1. `boolEncoding` ? LC bools translate perfectly to JS choice functions; this might also not be worth it.
