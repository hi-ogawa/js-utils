export function assertUnreachable(value: never): never {
  throw new Error("assertUnreachable", { cause: value });
}
