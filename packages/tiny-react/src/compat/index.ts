import type { FC } from "../helper/common";
import { useEffect, useRef, useState } from "../hooks";
import { render } from "../reconciler";
import { type BNode, type VNode, emptyNode } from "../virtual-dom";

// non comprehensive compatibility features

// https://react.dev/reference/react/useSyncExternalStore
// https://github.com/preactjs/preact/blob/9c5a82efcc3dcbd0035c694817a3022d81264687/compat/src/index.js#L154
export function useSyncExternalStore<T>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => T,
  _getServerSnapshot?: () => T
): T {
  const [value, setValue] = useState(() => getSnapshot());

  const latestRef = useRef({ getSnapshot });
  latestRef.current.getSnapshot = getSnapshot;

  useEffect(() => {
    return subscribe(() => {
      setValue(latestRef.current.getSnapshot());
    });
  }, [subscribe]);

  return value;
}

// https://react.dev/reference/react-dom/client/createRoot
export function createRoot(container: Element) {
  let bnode: BNode | undefined;
  return {
    render: (vnode: VNode) => {
      bnode = render(vnode, container, bnode);
    },
    unmount() {
      render(emptyNode(), container, bnode);
    },
  };
}

// TODO https://react.dev/reference/react/memo
export function memo<P extends object>(
  fc: FC<P>,
  _propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
): FC<P> {
  return fc;
}
