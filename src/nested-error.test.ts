import {NestedError, toError} from "./nested-error";

describe(nameof(NestedError), () => {
    describe('consturctor() when .stack exists', () => {
        it('doesnt throw on construction', () => {
            expect(() => new NestedError).not.toThrow();
        });

        it('returns an error with fully-fledged stack when runtime provides .stack prop', () => {
            (NestedError as any).getErrorReport = (err: Error) => err.stack!;
            expect(new NestedError('err1', new Error('err2')).stack)
                .toMatch(/err1.*at.*err2.*at/s);
        });

        it('returns an error with only error messages when runtime provides no .stack prop', () => {
            (NestedError as any).getErrorReport = (err: Error) => `${err.name}: ${err.message}`;
            expect(new NestedError('err1', new Error('err2')).stack)
                .toMatch(/err1.*err2/s);
        });
    });
    describe(nameof(NestedError.rethrow), () => {
        it('creates a function that returns NestedError factory with the given message', () => {
            const err = new Error('msg');
            expect(() => NestedError.rethrow('err-message')(err)).toThrowError(NestedError);
            try {
                NestedError.rethrow('err-message')(err);
            } catch (thrownErr) {
                expect(thrownErr).toHaveProperty('message', 'err-message');
                expect(thrownErr).toHaveProperty('innerError', err);
                expect(thrownErr).toHaveProperty('innerErrors', [err]);
            }
        });
        it('craetes an instance of derived class when called on dervied constructor', () => {
            class DerivedError extends NestedError {}
            expect(DerivedError.rethrow('eee')).toThrowError(DerivedError);
        });
    });

    describe("innerErrors", () => {
        it("contains the errors passed to the constructor", () => {
            const message = "Hello, Dolly!";
            const errors = [
                "Foo", 23, true, { toString: () => "blah" }, new Error("BOOM!")
            ].map(toError);
            const nestedError = new NestedError(message, ...errors);
            expect(nestedError).toHaveProperty('message', message);
            expect(nestedError).toHaveProperty('innerErrors');
            expect(nestedError.innerErrors).toEqual(errors);
        });

        it("returns null when an empty array is passed to the constructor", () => {
            const message = "Hello, Dolly!";
            const errors: Error[] = [];
            const nestedError = new NestedError(message, ...errors);
            expect(nestedError).toHaveProperty('message', message);
            expect(nestedError.innerErrors).toStrictEqual([]);
            expect(nestedError.innerError).toBeNull();
        });

        it("returns null when no errors are passed to the constructor", () => {
            const message = "Hello, Dolly!";
            const nestedError = new NestedError(message);
            expect(nestedError).toHaveProperty('message', message);
            expect(nestedError.innerErrors).toStrictEqual([]);
            expect(nestedError.innerError).toBeNull();
        });
    });
});


describe(nameof(toError), () => {
    it('returns instanceof Error unchanged', () => {
        const err = new Error;
        expect(toError(err)).toBe(err);
    });

    it('wraps non-error stringifyable values into Error having them stringified', () => {
        expect(toError('errr').message).toMatch(/errr/);
        expect(toError(14).message).toMatch(/14/);
        expect(toError(['str', true]).message).toMatch(/str,true/);
        expect(toError({ toString: () => 'ssss'}).message).toMatch(/ssss/);
    });

    it("doesn't throw on non-stringifyable values", () => {
        expect(toError({ toString: () => ({}) }).message).toMatch(/Failed to stringify/);
    });
});
