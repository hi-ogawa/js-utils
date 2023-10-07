import { render } from "../reconciler";
import { type BNode, type VNode, emptyNode } from "../virtual-dom";

//
// react
//

export function useSyncExternalStore() {}

//
// react-dom/client
//

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
