namespace Kurz
{
    class Ok<T>
    {
        constructor(readonly okValue: T) { }

        isOk<T>(): this is Ok<T> { return true; }

        isError<TError>(): this is Error<TError> { return false; }
    }

    class Error<TError>
    {
        constructor(readonly errorValue: TError) { }

        isOk<T>(): this is Ok<T> { return false; }

        isError<TError>(): this is Error<TError> { return true; }
    }
    
    /**
     * A discriminated union representing either a result or an error.
     */
    export type Result<T, TError> = Ok<T> | Error<TError>;

    export namespace Result
    {
        export function OfOk<T, TError>(value: T): Result<T, TError>
        {
            return new Ok(value);
        }

        export function OfError<T, TError>(value: TError): Result<T, TError>
        {
            return new Error(value);
        }
    }
}