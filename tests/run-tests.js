// Run all example tests

const {chdir} = process;

const examples = [ "basics-binary-scott"
                 , "basics-church"
                 , "hello-world"
                 , "counter"
                 , "delta-generators"
                 , "is-prime"
                 , "is-prime-scott"
                 , "prime-sieve"
                 , "multiply"
                 ];

try {
  chdir("tests");
  for (const example of examples) {
    describe(example, function() {
      chdir("./" + example);
      require("./" + example + "/test.js");
      chdir("..");
    });
  }
  chdir("..");
} catch (err) {
  console.error(err);
}
