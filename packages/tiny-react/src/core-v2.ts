// architecture inspired by yew
// https://github.com/yewstack/yew

import { range } from "@hiogawa/utils";

export function render(vnode: VNode, parent: HNode) {
  const bnode = reconcile(vnode, emptyNode(), parent);
  return bnode;
}

export function reconcile(
  vnode: VNode,
  bnode: BNode, // mutated
  parent: HNode // TODO: + where to append
): BNode {
  switch (vnode.type) {
    case "empty": {
      if (bnode.type === "empty") {
      } else {
        unmount(bnode);
        bnode = { ...vnode };
      }
      break;
    }
    case "tag": {
      if (
        bnode.type === "tag" &&
        bnode.key === vnode.key &&
        bnode.name === vnode.name
      ) {
        reconcileTagProps(bnode.hnode, vnode.props, bnode.props);
        bnode.props = vnode.props;
        bnode.child = reconcile(vnode.child, bnode.child, bnode.hnode);
      } else {
        unmount(bnode);
        // TODO: ref effect
        const hnode = document.createElement(vnode.name);
        const child = reconcile(vnode.child, emptyNode(), hnode);
        reconcileTagProps(hnode, vnode.props, {});
        parent.appendChild(hnode);
        bnode = { ...vnode, child, hnode } satisfies BTag;
      }
      break;
    }
    case "text": {
      if (bnode.type === "text") {
        if (bnode.data !== vnode.data) {
          bnode.hnode.data = vnode.data;
          bnode.data = vnode.data;
        }
      } else {
        unmount(bnode);
        const hnode = document.createTextNode(vnode.data);
        parent.appendChild(hnode);
        bnode = { ...vnode, hnode } satisfies BText;
      }
      break;
    }
    case "fragment": {
      if (bnode.type === "fragment" && bnode.key === vnode.key) {
        // TODO: need to move `bnode.children` within `parent`
        moveBnodesByKey(vnode.children, bnode.children);
      } else {
        unmount(bnode);
        bnode = { ...vnode, children: [] } satisfies BFragment;
      }
      // unmount exess bnode.children
      const bchildren = bnode.children;
      for (const bchild of bchildren.slice(vnode.children.length)) {
        unmount(bchild);
      }
      // reconcile vnode.children
      bnode.children = vnode.children.map((vchild, i) =>
        reconcile(vchild, bchildren[i] ?? emptyNode(), parent)
      );
      break;
    }
    case "custom": {
      // TODO: hook context
      if (
        bnode.type === "custom" &&
        bnode.key === vnode.key &&
        bnode.render === vnode.render
      ) {
        const vchild = vnode.render(vnode.props);
        bnode.props = vnode.props;
        bnode.child = reconcile(vchild, bnode.child, parent);
      } else {
        unmount(bnode);
        const vchild = vnode.render(vnode.props);
        const child = reconcile(vchild, emptyNode(), parent);
        bnode = { ...vnode, child } satisfies BCustom;
      }
      break;
    }
  }
  return bnode;
}

function moveBnodesByKey(vchildren: VNode[], bchildren: BNode[]) {
  const bKeyMap = new Map<NodeKey, [number, BNode]>();
  bchildren.forEach((bchild, i) => {
    const bkey = getNodeKey(bchild);
    if (typeof bkey !== "undefined") {
      bKeyMap.set(bkey, [i, bchild]);
    }
  });

  // for simplicity, align length (TODO: optimize by dealing with array with holes)
  if (bchildren.length < vchildren.length) {
    bchildren.push(
      ...range(vchildren.length - bchildren.length).map(() => emptyNode())
    );
  }

  vchildren.forEach((vchild, i) => {
    const vkey = getNodeKey(vchild);
    if (typeof vkey !== "undefined") {
      const found = bKeyMap.get(vkey);
      if (found) {
        const [j, jchild] = found;
        if (i !== j) {
          const ichild = bchildren[i];
          bchildren[i] = jchild;
          if (ichild) {
            bchildren[j] = ichild;
            const ikey = getNodeKey(ichild);
            if (typeof ikey !== "undefined") {
              bKeyMap.set(ikey, [j, ichild]);
            }
          }
        }
      }
    }
  });
}

function reconcileTagProps(hnode: HNode, props: Props, oldProps: Props) {
  if (!(hnode instanceof Element)) {
    return;
  }
  for (const k in oldProps) {
    if (!(k in props)) {
      hnode.removeAttribute(k);
    }
  }
  for (const k in props) {
    hnode.setAttribute(k, props[k] as any);
  }
}

function unmount(bnode: BNode) {
  // TODO: unmount/ref effect
  switch (bnode.type) {
    case "empty": {
      break;
    }
    case "tag": {
      unmount(bnode.child); // TODO: can skip actual remove since parent removes all anyways
      bnode.hnode.remove();
      break;
    }
    case "text": {
      bnode.hnode.remove();
      break;
    }
    case "fragment": {
      for (const child of bnode.children) {
        unmount(child);
      }
      break;
    }
    case "custom": {
      unmount(bnode.child);
      break;
    }
  }
}

//
// types
//

type NodeKey = string;
type Props = Record<string, unknown>;

// host node
type HNode = Element;
type HText = Text;

//
// virtual node
//

// TODO: optimize object shape?
export type VNode = VEmpty | VTag | VText | VCustom | VFragment;

type VEmpty = {
  type: "empty";
};

// dom element with tag name
// TODO: ref?
type VTag = {
  type: "tag";
  key?: NodeKey;
  name: string;
  props: Props;
  child: VNode;
};

// text node
type VText = {
  type: "text";
  data: string;
};

// user-defined functional component
type VCustom = {
  type: "custom";
  key?: NodeKey;
  props: Props;
  render: (props: Props) => VNode;
};

type VFragment = {
  type: "fragment";
  key?: NodeKey;
  children: VNode[];
};

//
// bundle node (mutated through reconcilation and works both as input and output)
//

// TODO: need pointer to parent for sub tree reconcilation?
type BNode = BEmpty | BTag | BText | BCustom | BFragment;

type BEmpty = VEmpty;

type BTag = Omit<VTag, "child"> & {
  child: BNode;
  hnode: HNode;
};

type BText = VText & {
  hnode: HText;
};

type BCustom = VCustom & {
  child: BNode;
};

type BFragment = Omit<VFragment, "children"> & {
  children: BNode[];
};

function emptyNode(): VNode & BNode {
  return {
    type: "empty",
  };
}

function getNodeKey(node: VNode | BNode): NodeKey | undefined {
  if (
    node.type === "tag" ||
    node.type === "custom" ||
    node.type === "fragment"
  ) {
    return node.key;
  }
  return;
}

//
// hyperscript helper
//

export const Fragment = Symbol.for("Fragment");

type ComponentType = VTag["name"] | VCustom["render"] | typeof Fragment;

type ComponentChild = VNode | string | number | null | undefined | boolean;

export function h(
  t: ComponentType,
  inProps: Props,
  ...children: ComponentChild[]
): VNode {
  const child: VNode =
    children.length === 0
      ? emptyNode()
      : {
          type: "fragment",
          children: children.map((c) => hComponentChild(c)),
        };

  const { key, ...props } = inProps as { key?: NodeKey };

  if (typeof t === "string") {
    return {
      type: "tag",
      name: t,
      key,
      props,
      child,
    };
  } else if (t === Fragment) {
    return child;
  } else if (typeof t === "function") {
    return {
      type: "custom",
      key,
      props,
      render: t,
    };
  }
  return t satisfies never;
}

function hComponentChild(child: ComponentChild): VNode {
  if (
    child === null ||
    typeof child === "undefined" ||
    typeof child === "boolean"
  ) {
    return {
      type: "empty",
    };
  }
  if (typeof child === "string" || typeof child === "number") {
    return {
      type: "text",
      data: String(child),
    };
  }
  return child;
}
