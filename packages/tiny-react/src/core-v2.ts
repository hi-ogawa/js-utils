import { tinyassert } from "@hiogawa/utils";

// architecture inspired by yew
// https://github.com/yewstack/yew

// TODO:
// - custom component re-rendering
// - rework slot?
// - hook

export function render(vnode: VNode, parent: HNode) {
  const bnode = reconcile(vnode, emptyNode(), parent);
  return bnode;
}

export function reconcile(
  vnode: VNode,
  bnode: BNode, // mutated
  parent: HNode, // rename to hparent?
  slot?: HNode // rename to preSlot?
): BNode {
  switch (vnode.type) {
    case "empty": {
      if (bnode.type === "empty") {
      } else {
        unmount(bnode);
        bnode = { ...vnode };
      }
      bnode.slot = slot;
      break;
    }
    case "tag": {
      if (
        bnode.type === "tag" &&
        bnode.key === vnode.key &&
        bnode.name === vnode.name
      ) {
        reconcileTagProps(bnode, vnode.props, bnode.props);
        bnode.props = vnode.props;
        bnode.child = reconcile(vnode.child, bnode.child, bnode.hnode);
        placeChild(bnode.hnode, parent, slot, false);
      } else {
        unmount(bnode);
        // TODO: ref effect
        const hnode = document.createElement(vnode.name);
        const child = reconcile(vnode.child, emptyNode(), hnode);
        bnode = { ...vnode, child, hnode, listeners: new Map() } satisfies BTag;
        reconcileTagProps(bnode, vnode.props, {});
        placeChild(bnode.hnode, parent, slot, true);
      }
      bnode.child.parent = bnode;
      break;
    }
    case "text": {
      if (bnode.type === "text") {
        if (bnode.data !== vnode.data) {
          bnode.hnode.data = vnode.data;
          bnode.data = vnode.data;
        }
        placeChild(bnode.hnode, parent, slot, false);
      } else {
        unmount(bnode);
        const hnode = document.createTextNode(vnode.data);
        bnode = { ...vnode, hnode } satisfies BText;
        placeChild(bnode.hnode, parent, slot, true);
      }
      break;
    }
    case "fragment": {
      // TODO: learn from
      // https://github.com/yewstack/yew/blob/30e2d548ef57a4b738fb285251b986467ef7eb95/packages/yew/src/dom_bundle/blist.rs#L416
      // https://github.com/snabbdom/snabbdom/blob/420fa78abe98440d24e2c5af2f683e040409e0a6/src/init.ts#L289
      if (bnode.type === "fragment" && bnode.key === vnode.key) {
        moveBnodesByKey(vnode.children, bnode.children);
      } else {
        unmount(bnode);
        bnode = { ...vnode, children: [] } satisfies BFragment;
      }
      // unmount excess bnode.children
      const bchildren = bnode.children;
      for (const bchild of bchildren.slice(vnode.children.length)) {
        unmount(bchild);
      }
      // reconcile vnode.children
      for (let i = 0; i < vnode.children.length; i++) {
        const bchild = reconcile(
          vnode.children[i],
          bchildren[i] ?? emptyNode(),
          parent,
          slot
        );
        slot = getSlot(bchild);
        bchild.parent = bnode;
        bnode.children[i] = bchild;
      }
      bnode.slot = slot;
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
        bnode.child = reconcile(vchild, bnode.child, parent, slot);
        bnode.props = vnode.props;
        bnode.hparent = parent;
      } else {
        unmount(bnode);
        const vchild = vnode.render(vnode.props);
        const child = reconcile(vchild, emptyNode(), parent, slot);
        bnode = { ...vnode, child, hparent: parent } satisfies BCustom;
      }
      bnode.child.parent = bnode;
      bnode.slot = getSlot(bnode.child);
      break;
    }
  }
  return bnode;
}

// `node` is positioned after `slot` within `parent`
function placeChild(
  node: HNode,
  parent: HNode,
  slot: HNode | undefined,
  init: boolean
) {
  // TODO: too much dom property access?
  const slotNext = slot ? slot.nextSibling : parent.firstChild;
  if (init || !(node === slotNext || node.nextSibling === slotNext)) {
    parent.insertBefore(node, slotNext);
  }
}

// aka. re-rendering custom component
selfReconcileCustom;
function selfReconcileCustom(vnode: VCustom, bnode: BCustom) {
  const oldSlot = getSlot(bnode);

  // traverse ancestors to find "slot"
  const preSlot = findPreviousSlot(bnode);
  const newBnode = reconcile(vnode, bnode, bnode.hparent, preSlot);

  // TODO
  // traverse ancestors again to fix up new `bnode.slot`?
  const newSlot = getSlot(newBnode);
  if (newSlot !== oldSlot) {
    if (newSlot && oldSlot) {
    }
    if (newSlot && !oldSlot) {
    }
    if (!newSlot && oldSlot) {
    }
  }
}

function findPreviousSlot(child: BNode): HNode | undefined {
  let parent = child.parent;
  while (parent) {
    if (parent.type === "tag") {
      // child is first within parent tag
      return;
    }
    if (parent.type === "fragment") {
      // TODO: faster look up within BFragment.children?
      const i = parent.children.indexOf(child);
      tinyassert(i >= 0);
      if (i > 0) {
        return getSlot(parent.children[i - 1]);
      }
    }
    child = parent;
    parent = child.parent;
  }
  return;
}

function moveBnodesByKey(
  vnodes: VNode[],
  bnodes: BNode[] // mutated
) {
  const bKeyToIndex = new Map<NodeKey, number>();
  bnodes.forEach((bnode, i) => {
    const bkey = getNodeKey(bnode);
    if (typeof bkey !== "undefined") {
      bKeyToIndex.set(bkey, i);
    }
  });

  // fill bnodes to ensure bnodes.length >= vnodes.length
  vnodes.forEach((_v, i) => {
    bnodes[i] ??= emptyNode();
  });

  const oldBnodes = [...bnodes];

  vnodes.forEach((vnode, i) => {
    const vkey = getNodeKey(vnode);
    if (typeof vkey !== "undefined") {
      const j = bKeyToIndex.get(vkey);
      if (typeof j !== "undefined" && i !== j) {
        bnodes[i] = oldBnodes[j];
      }
    }
  });
}

function reconcileTagProps(bnode: BTag, props: Props, oldProps: Props) {
  for (const k in oldProps) {
    if (!(k in props)) {
      removeTagProp(bnode, k);
    }
  }
  for (const k in props) {
    if (props[k] !== oldProps[k]) {
      setTagProp(bnode, k, props[k]);
    }
  }
}

function setTagProp(bnode: BTag, key: string, value: unknown) {
  if (key.startsWith("on")) {
    const eventType = key.slice(2).toLowerCase();
    const listener = bnode.listeners.get(eventType);
    if (listener) {
      bnode.hnode.removeEventListener(eventType, listener);
    }
    tinyassert(
      typeof value === "function",
      `Invalid event listener prop for '${eventType}'`
    );
    bnode.listeners.set(eventType, value as any);
    bnode.hnode.addEventListener(eventType, value as any);
  } else {
    bnode.hnode.setAttribute(key, value as any);
  }
}

function removeTagProp(bnode: BTag, key: string) {
  if (key.startsWith("on")) {
    const eventType = key.slice(2).toLowerCase();
    const listener = bnode.listeners.get(eventType);
    if (listener) {
      bnode.hnode.removeEventListener(eventType, listener);
    }
  } else {
    bnode.hnode.removeAttribute(key);
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
type HNode = Node;
type HTag = Element;
type HText = Text;

//
// virtual node (immutable)
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

type BNode = BEmpty | BTag | BText | BCustom | BFragment;

type BNodeParent = BTag | BCustom | BFragment;

type BEmpty = VEmpty & {
  parent?: BNodeParent;
  slot?: HNode; // probably not needed but it simplifies fragment children reconcilation
};

type BTag = Omit<VTag, "child"> & {
  parent?: BNodeParent;
  child: BNode;
  hnode: HTag;
  listeners: Map<string, () => void>;
};

type BText = VText & {
  parent?: BNodeParent;
  hnode: HText;
};

type BCustom = VCustom & {
  parent?: BNodeParent;
  child: BNode;
  slot?: HNode;
  hparent: HNode; // need back pointer for self re-rendering?
};

type BFragment = Omit<VFragment, "children"> & {
  parent?: BNodeParent;
  children: BNode[];
  slot?: HNode;
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

// BNode slot holds last HNode up to itself within the same parent
// i.e. next BNode should follow the slot
function getSlot(node: BNode): HNode | undefined {
  if (node.type === "tag" || node.type === "text") {
    return node.hnode;
  }
  return node.slot; // TODO: rename to "node.last" or "node.nextSlot"?
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
  const vchildren = children.map((c) => normalizeComponentChild(c));
  const vchild: VNode =
    children.length === 0
      ? emptyNode()
      : {
          type: "fragment",
          children: vchildren,
        };

  const { key, ...props } = inProps as { key?: NodeKey };

  if (typeof t === "string") {
    return {
      type: "tag",
      name: t,
      key,
      props,
      child: vchild,
    };
  } else if (t === Fragment) {
    return {
      type: "fragment",
      key,
      children: vchildren,
    };
  } else if (typeof t === "function") {
    return {
      type: "custom",
      key,
      props: {
        ...props,
        children: vchild,
      },
      render: t,
    };
  }
  return t satisfies never;
}

function normalizeComponentChild(child: ComponentChild): VNode {
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
