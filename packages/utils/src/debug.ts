import { escapeRegExp } from "./regexp";

// simpler https://github.com/debug-js/debug/
// - use globalThis.__DEBUG for browser

export function createDebug(namespace: string) {
  const pattern = createDebugPattern(namespace);
  return (...args: unknown[]) => {
    process.stderr.isTTY;
    const flag =
      globalThis.process?.env?.["DEBUG"] ?? (globalThis as any).__DEBUG;
    if (typeof flag === "string" && pattern.test(flag)) {
      console.error(`⊳ ${namespace}`, ...args);
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
