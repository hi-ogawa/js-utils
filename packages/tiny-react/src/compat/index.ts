import { once } from "@hiogawa/utils";
import { useEffect, useRef, useState } from "../hooks";
import { render } from "../reconciler";
import {
  type BNode,
  EMPTY_NODE,
  type FC,
  NODE_TYPE_CUSTOM,
  type VCustom,
  type VNode,
} from "../virtual-dom";

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
  Fc: FC<P>,
  isEqualProps: (prev: {}, next: {}) => boolean = objectShallowEqual
): FC<P> {
  function Memo(props: P) {
    const [manager] = useState(() => new MemoManager(Fc, props, isEqualProps));
    manager.update(props);
    return manager.vnode;
  }
  Object.defineProperty(Memo, "name", { value: `Memo(${Fc.name})` });
  return Memo;
}

class MemoManager {
  public vnode: VCustom;

  // TODO
  // currently single `VCustom.render` identity is required, but `FcOnce` must be invalidated on update.
  // this cache is not necessary if "identical vnode" optimization is implemented.
  // with that optimization, simple this should work:
  //   vnode = {
  //     type: NODE_TYPE_CUSTOM,
  //     render: Fc,
  //     props,
  //   }
  private FcOnce: FC<{}>;
  private render = (props: {}) => this.FcOnce(props);

  constructor(
    private Fc: FC<any>,
    props: {},
    private isEqualProps: (prev: {}, next: {}) => boolean
  ) {
    this.vnode = {
      type: NODE_TYPE_CUSTOM,
      render: this.render,
      props,
    };
    this.FcOnce = once(this.Fc);
  }

  update(props: {}) {
    if (!this.isEqualProps(this.vnode.props, props)) {
      this.vnode = {
        type: NODE_TYPE_CUSTOM,
        render: this.render,
        props,
      };
      this.FcOnce = once(this.Fc);
    }
  }
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
