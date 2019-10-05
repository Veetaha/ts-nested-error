# ts-nested-error

[![npm version](https://badge.fury.io/js/ts-nested-error.svg)](https://badge.fury.io/js/ts-nested-error)
[![Build Status](https://travis-ci.com/Veetaha/ts-nested-error.svg?branch=master)](https://travis-ci.com/Veetaha/ts-nested-error)
[![Coverage Status](https://coveralls.io/repos/github/Veetaha/ts-nested-error/badge.svg?branch=master)](https://coveralls.io/github/Veetaha/ts-nested-error?branch=master)

Super lightweight crossplatform (browser compatible) dependency-free nested error implementation.

## :zap: Rationale

Suppose you are handling some low-level error and need to throw a higher-level one while having its original cause attached to it for debug purposes.

This package provides an extremely concise C#-like `NestedError` implementation for you:

```ts
import { NestedError } from 'ts-nested-error';

try {
    dataService.saveData(data);
} catch (err) {
    throw new NestedError("DataService failed to save data", err);
}
```
This code will produce an error that when stringified shows the following message:
```
NestedError: DataService failed to save data
    at someMethod (/path/to/code.js:line:column)
    at ...

======= INNER ERROR =======

Error: Connection timed out
    at someMethod (/path/to/code.js:line:column)
    at ...
```

## :scroll: Documentation
Everything is strongly typed and you may expect good inline documentation from VSCode.

## :sunglasses: Features of `NestedError`

### Stack property
Property `.stack` of `NestedError` is guaranteed to contain a string with error
callstack if it is supported by runtime or `"${err.name}: ${err.message}"` as a fallback.

### InnerError property

`NestedError` constructor automatically coerces the value passed as the second argument `toError()` object and saves it in `.innerError` property. 


### Promise error handler shortcut

Suppose you invoke some async operation and don't want to to write verbose
error handling lambda to pass as `onerror` callback to `.then()` or `.catch()`.

Static `NestedError.rethrow(message)` method is here to shorten you code:

```ts
userService.getPage().then(
    data => console.log(`Hooray! data: ${data}`),
    err => {
        throw new NestedError('failed to fetch users page', err);
    }
);

  ↓ ↓ ↓ ↓ ↓ ↓

userService.getPage().then(
    data => console.log(`Hooray! data: ${data}`),
    NestedError.rethrow('failed to fetch users page')
);
```
It just creates the same error handling callback that rethrows passed-in error with given `message`.


### Coerse values to Error

Suppose you are handling an error within the catch clause.
Though it may seem very unlikely, the thrown value is not required to be `instanceof Error`.

Exported `toError(value)` free function ensures that for you.

It returns `value` itself if `value instanceof Error`, otherwise attempts to
stringify it and wrap into `Error` object to be returned.

```ts
const err = new Error('oops');

// noop if err instanceof Error
toError(err) === err; 

// wrapped 42 into Error with warning message
(toError(42) instanceof Error) === true; 

toError('non-error value').message === `Value that is not an instance of Error was thrown: non-error value`

```

