export function assertUnreachable(_value: never): never {
  throw new Error("assertUnreachable", { cause: _value });
}
