
/**
 * Subclass of standard `Error` that eagerly collects the callstack of the error
 * that caused it. This way you can investigate the core problem that happened
 * by looking at the callstack from up to bottom (from higher level errors to
 * lower level).
 */
export class NestedError extends Error {

    /**
     * Combined callstack of this error and the errors that it wraps.
     * If the JavaScript runtime doesn't support `Error::stack` property
     * this will contain only the concatenated messages.
     */
    readonly stack: string;

    /**
     * Optional reference to lower-level errors wrapped by this error.
     */
    readonly innerErrors: Error | Error[] | null;

    /**
     * Provides the first `Error` of the `innerErrors` (if it exists);
     * otherwise, `null`.
     *
     * @deprecated Please shift to using the `innerErrors` (with an 's') property.
     */
    get innerError() {
        if(!this.innerErrors) {
            return null;
        } else if(this.innerErrors instanceof Array) {
            if(this.innerErrors.length === 0) {
                return null;
            } else {
                return this.innerErrors[0];
            }
        } else {
            return this.innerErrors;
        }
    }

    private static readonly getErrorReport = typeof new Error().stack === 'string'
        ? (err: Error) => err.stack!
        : (err: Error) => `${err.name}: ${err.message}`;

    /**
     * Returns the function that accepts any value that was thrown as the first argument and
     * throws it wrapped into `NestedError` or class derived from `NestedError` (provided
     * this method was called directly in the context of that dervied class constructor)
     * with the given `message`.
     * Returned function will pass accepted `Error` object directly to `NestedError`
     * as `innerErrors` by invoking `toError(err)` on it.
     *
     * @param message Message to attach `NestedError` created by the returned function.
     */
    static rethrow(message: string) {
        return (...errs: unknown[]) => { throw new this(message, ...errs); };
    }


    /**
     * Allocates an instance of `NestedError` with the given error `message` and
     * optional `innerError` (which will be automatically coerced using `toError()`).
     *
     * @param message     Laconic error message to attach to the created `NestedError`.
     * @param innerErrors Optional errors that will be wrapped by this higher level
     *                    error. This value will be automatically coerced using `toError()`.
     */
    constructor(message?: string, ...innerErrors: unknown[]) {
        super(message);
        const thisErrorReport = NestedError.getErrorReport(this);
        const errorLength = innerErrors.length;
        if (errorLength === 1) {
            this.innerErrors = toError(innerErrors[0]);
            this.stack = `${thisErrorReport}\n\n======= INNER ERROR =======\n\n${NestedError.getErrorReport(this.innerErrors)}`;
        } else if(errorLength > 1) {
            this.innerErrors = innerErrors.map(toError);
            this.stack = thisErrorReport + "\n\n" +
                this.innerErrors.map(
                    (error, idx) => `======= INNER ERROR (${idx+1} of ${errorLength}) =======\n\n${NestedError.getErrorReport(error)}`
                ).join("\n\n");
        } else {
            this.innerErrors = null;
            this.stack      = thisErrorReport;
        }
    }
}

NestedError.prototype.name = nameof(NestedError);

/**
 * @deprecated You should not call this function on an object of statically assumed `Error` type,
 *             because it is intended to be used in a dynamic context where the type of thrown value
 *             is not known ahead of time (during the compile time).
 */
export function toError(err: Error): Error;

/**
 * Returns `err` itself if `err instanceof Error === true`, otherwise attemts to
 * stringify it and wrap into `Error` object to be returned.
 *
 * **This function is guaranteed never to throw.**
 *
 * @param err Possbile `instanceof Error` to return or value of any type that will
 *            be wrapped into a fully-fledged `Error` object.
 */
export function toError(err: unknown): Error;

export function toError(err: unknown) {
    try {
        return err instanceof Error
            ? err
            : new Error(`Value that is not an instance of Error was thrown: ${err}`);
    } catch (err) {
        return new Error(
            "Failed to stringify non-instance of Error that was thrown." +
            "This is possibly due to the fact that toString() method of the value" +
            "doesn't return a primitive value."
        );
    }
}
