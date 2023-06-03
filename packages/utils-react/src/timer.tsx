import { debounce } from "@hiogawa/utils";
import React from "react";
import { useStableCallback } from "./utils";

export function useDebounce<F extends (...args: any[]) => void>(
  f: F,
  ms: number
) {
  f = useStableCallback(f);

  const [isPending, setIsPending] = React.useState(false);

  const debounced = React.useCallback(
    debounce(f, ms, {
      onStart: () => setIsPending(true),
      onFinish: () => setIsPending(false),
      onCancel: () => setIsPending(false),
    }),
    [ms]
  );

  React.useEffect(() => {
    () => {
      debounced.cancel();
    };
  }, []);

  return [debounced, { isPending }];
}
