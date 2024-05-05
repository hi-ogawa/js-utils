import { escapeRegExp } from "./regexp";

// simpler https://github.com/debug-js/debug/
// - use globalThis.__DEBUG for browser

export function createDebug(namespace: string) {
  const pattern = createDebugPattern(namespace);
  return (...args: unknown[]) => {
    const flag =
      (globalThis as any).process?.env?.["DEBUG"] ??
      (globalThis as any).__DEBUG;
    if (typeof flag === "string" && pattern.test(flag)) {
      let prefix = `⊳ ${namespace}`;
      const stderr = (globalThis as any)?.process?.stderr;
      if (stderr) {
        if (stderr?.isTTY) {
          prefix = `\u001B[1m${prefix}\u001B[22m`;
        }
        console.error(prefix, ...args);
      } else {
        console.debug(prefix, ...args);
      }
    }
  };
}

export function createDebugPattern(namespace: string) {
  const parts = namespace.split(":");
  const alts = [namespace];
  for (let i = 1; i < parts.length; i++) {
    alts.push(parts.slice(0, i).join(":") + ":*");
  }
  const pattern = alts.map((pattern) => escapeRegExp(pattern)).join("|");
  return new RegExp(`(^|,)(${pattern})($|,)`);
}
