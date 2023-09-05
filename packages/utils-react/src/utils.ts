import React from "react";

export function usePrevious<T>(value: T): T {
  const ref = React.useRef(value);
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

// cf. https://github.com/facebook/react/issues/14099#issuecomment-440013892
export function useStableRef<T>(value: T): React.MutableRefObject<T> {
  const ref = React.useRef(value);

  // silence SSR useLayoutEffect warning until https://github.com/facebook/react/pull/26395
  const useEffect =
    typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

  useEffect(() => {
    ref.current = value;
  });

  return ref;
}

export function useStableCallback<F extends (...args: any[]) => any>(
  callback: F,
): F {
  const ref = useStableRef(callback);
  const wrapper = ((...args: any[]) => ref.current(...args)) as F;
  return React.useCallback(wrapper, []);
}

export function useRerender() {
  return React.useReducer((prev) => !prev, false)[1];
}

// create RefCallback via useEffect-like api
export function useRefCallbackEffect<T>(
  effect: (value: T) => (() => void) | void | undefined,
): React.RefCallback<T> {
  const stableEffect = useStableCallback(effect);

  const destructorRef = React.useRef<(() => void) | void>();

  const refCallback: React.RefCallback<T> = (value) => {
    if (value) {
      destructorRef.current = stableEffect(value);
    } else {
      destructorRef.current?.();
    }
  };

  return React.useCallback(refCallback, []);
}
