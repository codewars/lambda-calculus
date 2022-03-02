# LC Compiler for Codewars

![logo-black](./logo/logo-black.svg#gh-light-mode-only)
![logo-white](./logo/logo-white.svg#gh-dark-mode-only)

Written by [Kacarott](https://github.com/Kacarott) and [JohanWiltink](https://github.com/JohanWiltink)

### Install

```bash
$ npm i --save @codewars/lambda-calculus
```

### Usage

> NOTE: When writing tests on Codewars, you can use the predefined wrapper module "./files.js" to get
> the solution file instead of using `fs` like below.

```javascript
import { readFileSync } from "fs";
// Import module
import * as LC from "@codewars/lambda-calculus";

// Set config options
LC.config.purity = "Let";
LC.config.numEncoding = "Church";

const code = readFileSync("solution.lc", {encoding: "utf8"});
// Compile
const solution = compile(code).TRUE;
// or
const {TRUE,FALSE} = compile(code);

// Use
console.log(solution(true)(false)); // true
// or
console.log(TRUE(true)(false)) // true
```

### Documentation


---

`compile :: String -> {String: (Term -> Term)}`

`compile` is the main entry point of the module. Compiles the specified text according the current `config` options, and returns an object binding all defined terms to their corresponding functions.

---

`config :: {String: String}`

`config` is an object which provides the interface for controlling how compilation behaves. Currently there are three configurable properties: `purity`, `numEncoding` and `verbosity`.

| Property | Option | Description |
| -------- | ---- | ---- |
| `purity` | `Let` | Allows definition of named terms which can be used in subsequent definitions. Does *not* support recursion. |
|  | `LetRec` | The same as `Let`, but additionally supporting direct recursion. |
|  | `PureLC` (default) | Pure lambda calculus only. Terms are still named so that they can be accessed by tests, but named terms may not be used elsewhere. |
| `numEncoding` | `None` | No number encoding. Use of number literals will cause an error. |
|  | `Church`<br>`Scott`<br>`BinaryScott` | Number literals will be automatically converted to corresponding LC terms, according to the encoding chosen. |
| `verbosity` | `Calm`<br>`Concise`<br>`Loquacious`<br>`Verbose` | Controls the amount of information that will be reported during compilation. |

### Container Image

The container image used by the Code Runner is available on [GHCR](https://github.com/codewars/lambda-calculus/pkgs/container/lambda-calculus).

```bash
docker pull ghcr.io/codewars/lambda-calculus:latest
```

#### Building

The image can be built from this repository:

```bash
docker build -t ghcr.io/codewars/lambda-calculus:latest .
```

#### Usage

See [example/](./example/) to learn how to use the image to test locally.
