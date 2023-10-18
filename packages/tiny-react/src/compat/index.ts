import { createElement } from "../helper/hyperscript";
import { useEffect, useRef, useState } from "../hooks";
import { render } from "../reconciler";
import { type BNode, EMPTY_NODE, type FC, type VNode } from "../virtual-dom";

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
      render(EMPTY_NODE, container, bnode);
    },
  };
}

// https://react.dev/reference/react/memo
export function memo<P extends {}>(
  fc: FC<P>,
  propsAreEqual: (
    prevProps: Readonly<P>,
    nextProps: Readonly<P>
  ) => boolean = objectShallowEqual
): FC<P> {
  function Memo(props: P) {
    const prev = useRef<{ props: Readonly<P>; result: VNode } | undefined>(
      undefined
    );
    if (!prev.current || !propsAreEqual(prev.current.props, props)) {
      prev.current = { props, result: createElement(fc, props) };
    }
    return prev.current.result;
  }
  Object.defineProperty(Memo, "name", { value: `Memo(${fc.name})` });
  return Memo;
}

// from preact https://github.com/preactjs/preact/blob/4b1a7e9276e04676b8d3f8a8257469e2f732e8d4/compat/src/util.js#L19-L23
function objectShallowEqual(x: object, y: object): boolean {
  for (const k in x) {
    if (!(k in y)) {
      return false;
    }
  }
  for (const k in y) {
    if ((x as any)[k] !== (y as any)[k]) {
      return false;
    }
  }
  return true;
}
