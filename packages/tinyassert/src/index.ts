// https://github.com/hi-ogawa/ytsub-v3/blob/2b5931639e5c97f1d9dc6cc7ec4d89df70275084/app/misc/assert.ts

export class TinyAssertionError extends Error {
  constructor(message?: string, stackStartFunction?: Function) {
    super(message);
    if ("captureStackTrace" in Error) {
      // @ts-ignore-error
      Error.captureStackTrace(this, stackStartFunction ?? TinyAssertionError);
    }
  }
}

export function tinyassert(value: any, message?: string): asserts value {
  if (value) {
    return;
  }
  throw new TinyAssertionError(message, tinyassert);
}
