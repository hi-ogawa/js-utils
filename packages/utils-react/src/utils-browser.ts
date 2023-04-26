import React from "react";
import { useStableCallback } from "./utils";

export function useSetInterval(callback: () => void, ms: number) {
  const stableCallback = useStableCallback(callback);

  React.useEffect(() => {
    const subscription = window.setInterval(stableCallback, ms);
    return () => {
      window.clearInterval(subscription);
    };
  }, [ms]);
}

export function useSetTimeout(callback: () => void, ms: number) {
  const stableCallback = useStableCallback(callback);

  React.useEffect(() => {
    const subscription = window.setTimeout(stableCallback, ms);
    return () => {
      window.clearTimeout(subscription);
    };
  }, [ms]);
}

export function useDocumentEvent<K extends keyof DocumentEventMap>(
  type: K,
  callback: (e: DocumentEventMap[K]) => void
) {
  const stableCallback = useStableCallback(callback);

  React.useEffect(() => {
    document.addEventListener(type, stableCallback);
    return () => {
      document.removeEventListener(type, stableCallback);
    };
  }, []);
}
