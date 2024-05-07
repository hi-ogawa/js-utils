import React from "react";
import { useStableCallback } from "./utils";

// cf. https://github.com/hi-ogawa/ytsub-v3/blob/859264f683e8d1c6331ca1c630101c037a78dd94/app/utils/hooks.ts#L6

export function useRafLoop(
  callback: (time?: DOMHighResTimeStamp) => void,
): void {
  const stableCallback = useStableCallback(callback);

  // TODO: concurrent-safe?
  React.useEffect(() => {
    let id: number | undefined;
    function loop(time?: DOMHighResTimeStamp) {
      id = requestAnimationFrame(loop);
      stableCallback(time);
    }
    loop();
    return () => {
      if (typeof id === "number") {
        cancelAnimationFrame(id);
      }
    };
  }, []);
}

export function useRafTime(enabled: boolean): number | undefined {
  const [time, setTime] = React.useState<number>();
  const [origin, setOrigin] = React.useState<number>();

  React.useEffect(() => {
    setTime(undefined);
    setOrigin(undefined);
  }, [enabled]);

  useRafLoop((next) => {
    if (!enabled) {
      return;
    }
    if (typeof next === "undefined" || typeof origin === "undefined") {
      setOrigin(next);
    } else {
      setTime((time) => (time ?? 0) + (next - origin));
    }
  });

  return time;
}
