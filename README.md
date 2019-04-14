# automutate-tests

[![Greenkeeper badge](https://badges.greenkeeper.io/automutate/automutate-tests.svg)](https://greenkeeper.io/)

End-to-end test utilities for packages that rely on `automutate`.

## Usage

`automutate-tests` exports a `describeMutationTestCases` function that takes in three arguments:

1. Root path to search under for cases
2. A method to create a mutation provider for each file.
3. Names of files that test cases are composed of.

Its `describe` method takes in a a directory path containing test case directories.

Note that `TestsFactory` expects global `describe` and `it` functions to be declared.
If you're using a runner like Mocha or Jasmine this will work.
It also expects `chai` to be explicitly installed.

```shell
npm install --save-dev chai mocha
```

### Sample Usage

Define a test file with JavaScript or TypeScript similar to the following:

```typescript
import { describeMutationTestCases } from "automutate-tests";
import * as path from "path";

import { MyMutationsProvider } from "./MyMutationsProvider";

describeMutationTestCases(
    path.join(__dirname, "cases"),
    (fileName, settingsFileName) => new MyMutationsProvider(fileName, settingsFileName),
    {
        actual: "actual.txt",
        expected: "expected.txt",
        original: "original.txt",
        settings: "settings.txt"
    });
};
```

Then, create a directory named `cases` with at least one sub-directory ("case").
Each case should contain files named `expected.txt` and `original.txt` with your extension.

When tests are run, the `original.txt` file will be copied to an `actual.txt` file and mutated.
It should then contain the same contents as the `expected.txt` file.
