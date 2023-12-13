// https://doc.rust-lang.org/std/result/

export type Result<T, E> = { ok: true; value: T } | { ok: false; value: E };

export function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function Err<T>(value: T): Result<never, T> {
  return { ok: false, value };
}

export function wrapError<T>(getValue: () => T): Result<T, unknown> {
  try {
    return Ok(getValue());
  } catch (e) {
    return Err(e);
  }
}

export async function wrapErrorAsync<T>(
  getValue: () => PromiseLike<T>
): Promise<Result<T, unknown>> {
  try {
    return Ok(await getValue());
  } catch (e) {
    return Err(e);
  }
}

export function okToOption<T>(result: Result<T, unknown>): T | undefined {
  return result.ok ? result.value : undefined;
}

/**
 * @deprecated use `wrapErrorAsync` instead
 */
export async function wrapPromise<T>(
  value: PromiseLike<T>
): Promise<Result<T, unknown>> {
  try {
    return Ok(await value);
  } catch (e) {
    return Err(e);
  }
}
