# LC Compiler and test support for Codewars

Written by [Kacarott](https://github.com/Kacarott) and [JohanWiltink](https://github.com/JohanWiltink)


### Running example tests

Simply run `npm test` from this directory.

### Usage

```javascript
// Import module
const LC = require("./src/lambda-calculus.js");

// Set config options
LC.config.purity = "Let";
LC.config.numEncoding = "Church";

// Compile
const solution = compile().TRUE;
// or
const {TRUE,FALSE} = compile();

// Use
console.log(solution(true)(false)); // true
// or
console.log(TRUE(true)(false)) // true
```

### Documentation


---

`compile :: String? -> {String: (Term -> Term)}`

`compile` is the main entry point of the module. Compiles the specified text according the current `config` options, and returns an object binding all defined terms to their corresponding functions.

If called without an argument, will try open a file called `solution.txt` in the same directory, and parse its contents.


---

`config :: {String: String}`

`config` is an object which provides the interface for controlling how compilation behaves. Currently there are three configurable properties: `purity`, `numEncoding` and `verbosity`.

| Property | Option | Description |
| -------- | ---- | ---- |
| `purity` | `Let` (default) | Allows definition of named terms which can be used in subsequent definitions. Does *not* support recursion. |
|  | `LetRec` | The same as `Let`, but additionally supporting direct recursion. |
|  | `PureLC` | Pure lambda calculus only. Terms are still named so that they can be accessed by tests, but named terms may not be used elsewhere. |
| `numEncoding` | `None` | No number encoding. Use of number literals will cause an error. |
|  | `Church`<br>`Scott`<br>`BinaryScott` | Number literals will be automatically converted to corresponding LC terms, according to the encoding chosen. |
| `verbosity` | `Calm`<br>`Concise`<br>`Loquacious`<br>`Verbose` | Controls the amount of information that will be reported during compilation. |
