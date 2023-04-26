import React from "react";
import { useRerender } from "./utils";

// TODO: support SSR by returning undefined?
export function useMatchMedia(query: string) {
  const result = React.useMemo(() => window.matchMedia(query), [query]);
  const rerender = useRerender();

  React.useEffect(() => {
    result.addEventListener("change", rerender);
    return () => result.removeEventListener("change", rerender);
  }, [result]);

  return result;
}
