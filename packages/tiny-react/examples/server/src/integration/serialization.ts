export function jsonEscapeSymbol(v: unknown) {
  return JSON.stringify(v, function (_k, v) {
    // escape collision
    if (typeof v === "string" && v.startsWith("!")) {
      return "!" + v;
    }
    // symbol
    if (typeof v === "symbol" && typeof v.description === "string") {
      return "!s:" + v.description;
    }
    return v;
  });
}

export function jsonUnescapeSymbol(s: string) {
  return JSON.parse(s, function (_k, v) {
    if (typeof v === "string" && v.startsWith("!s:")) {
      return Symbol.for(s.slice(3));
    }
    if (typeof v === "string" && v.startsWith("!")) {
      return v.slice(1);
    }
    return v;
  });
}
