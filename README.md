# ts-nested-error

Super lightweight crossplatform (browser compatible) dependency-free nested error implementation.

### `new NestedError(message: string, public readonly innerError?: Error)`

Class that provides `readonly innerError?: Error` property alongside with an error callstack (as `.stack` property) of original error eagerly
combined with itself's. Deeply nested errors
form a list of callstacks and error messages that are concatenated.

**Example:**

```ts
    try {
        throw new Error('Connection timed out');
    } catch (err) {
        throw new NestedError(`Oh no, couldn't load file! More info in inner error`, err);
    }
```

This code will produce an error that when stringifed shows the following message:
```
NestedError: Oh no, couldn't load file! More info in inner error
    at someMethod (/path/to/code.js:line:column)
    at ...

======= INNER ERROR =======

Error: Connection timed out
    at someMethod (/path/to/code.js:line:column)
    at ...
```

### `NestedError.rethrow(message: string)` 
Returns a function that throws `NestedError` or an object
of class that is derived from it with the given `message`.
This is mostly intended to be a shorthand to create error wrapping callbacks
for `Promise`s:

```ts
import { NestedError } from 'ts-nested-error';

class DbError extends NestedError {}

database.get().then(
    data => console.log(`Hooray! data: ${data}`),
    DbError.rethrow('some database error happened') // throws instanceof DbError
);
```

### `toError(err)`

Returns `err` itself if `err instanceof Error === true`, otherwise attemts to
stringify it and wrap into `Error` object to be returned.

```ts
const err = new Error('oops');

// noop if err instanceof Error
toError(err) === err; 

// wrapped 42 into Error with warning message
(toError(42) instanceof Error) === true; 

toError('non-error value').message === `Value that is not an instance of Error was thrown: non-error value`

```

