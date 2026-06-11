/**
 * Canonical Result type for *expected* failures (validation, business rules).
 * Throw exceptions for *unexpected* failures (DB down, provider errors).
 */
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });

export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
