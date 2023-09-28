import { tinyassert } from "@hiogawa/utils";

// architecture inspired by yew
// https://github.com/yewstack/yew

// TODO:
// - schedule re-render
// - state hook
// - effect hook (ref, mount, unmount)

export function render(vnode: VNode, parent: HNode) {
  return reconcile(vnode, emptyNode(), parent);
}

// returns bnode with same object identity when vnode is reconciled over the same bnode
// in which case bnode input is mutated.
export function reconcile(
  vnode: VNode,
  bnode: BNode, // mutated
  hparent: HNode,
  preSlot?: HNode
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
        reconcileTagProps(bnode, vnode.props, bnode.props);
        bnode.props = vnode.props;
        bnode.child = reconcile(vnode.child, bnode.child, bnode.hnode);
        placeChild(bnode.hnode, hparent, preSlot, false);
      } else {
        unmount(bnode);
        // TODO: ref effect
        const hnode = document.createElement(vnode.name);
        const child = reconcile(vnode.child, emptyNode(), hnode);
        bnode = { ...vnode, child, hnode, listeners: new Map() } satisfies BTag;
        reconcileTagProps(bnode, vnode.props, {});
        placeChild(bnode.hnode, hparent, preSlot, true);
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
        placeChild(bnode.hnode, hparent, preSlot, false);
      } else {
        unmount(bnode);
        const hnode = document.createTextNode(vnode.data);
        bnode = { ...vnode, hnode } satisfies BText;
        placeChild(bnode.hnode, hparent, preSlot, true);
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
          hparent,
          preSlot
        );
        preSlot = getSlotForNext(bchild, preSlot);
        bchild.parent = bnode;
        bnode.children[i] = bchild;
      }
      bnode.slot = preSlot;
      break;
    }
    case "custom": {
      // TODO: hook context
      if (
        bnode.type === "custom" &&
        bnode.key === vnode.key &&
        bnode.render === vnode.render
      ) {
        const vchild = vnode.render({ ...vnode.props, forceUpdate });
        bnode.child = reconcile(vchild, bnode.child, hparent, preSlot);
        bnode.props = vnode.props;
        bnode.hparent = hparent;
      } else {
        unmount(bnode);
        const vchild = vnode.render({ ...vnode.props, forceUpdate });
        const child = reconcile(vchild, emptyNode(), hparent, preSlot);
        bnode = { ...vnode, child, hparent } satisfies BCustom;
      }
      bnode.child.parent = bnode;
      bnode.slot = getSlot(bnode.child);

      // expose "forceUpdate" via props
      const vcustom = vnode;
      const bcustom = bnode;
      function forceUpdate() {
        selfReconcileCustom(vcustom, bcustom);
      }
      break;
    }
  }
  return bnode;
}

// `hnode` is positioned after `preSlot` within `hparent`
function placeChild(
  hnode: HNode,
  hparent: HNode,
  preSlot: HNode | undefined,
  init: boolean
) {
  // TODO: too much dom property access?
  const slotNext = preSlot ? preSlot.nextSibling : hparent.firstChild;
  if (init || !(hnode === slotNext || hnode.nextSibling === slotNext)) {
    hparent.insertBefore(hnode, slotNext);
  }
}

// aka. re-rendering custom component
export function selfReconcileCustom(vnode: VCustom, bnode: BCustom) {
  const oldSlot = getSlot(bnode);

  // traverse ancestors to find "slot"
  const preSlot = findPreviousSlot(bnode);

  // reconcile
  const newBnode = reconcile(vnode, bnode, bnode.hparent, preSlot);
  tinyassert(newBnode === bnode); // reconciled over itself without unmount

  // fix up ancestors slot
  const newSlot = getSlot(bnode);
  if (oldSlot !== newSlot) {
    updateParentSlot(bnode);
  }
}

function findPreviousSlot(child: BNode): HNode | undefined {
  let parent = child.parent;
  while (parent) {
    if (parent.type === "tag") {
      // no slot i.e. child is first within parent tag
      return;
    }
    if (parent.type === "fragment") {
      // TODO
      // need faster look up within BFragment.children?
      // though this wouldn't be so bad practically since we traverse up to only first BTag ancestor
      let slot: HNode | undefined;
      for (const c of parent.children) {
        if (c === child) {
          // otherwise it didn't find previous slot within the fragment
          // so give up and go up to next parent
          if (slot) {
            return slot;
          }
          break;
        }
        slot = getSlotForNext(c, slot);
      }
    }
    // go up to parent also when parent.type === "custom"
    child = parent;
    parent = child.parent;
  }
  return;
}

function updateParentSlot(child: BNode) {
  let parent = child.parent;
  while (parent) {
    if (parent.type === "tag") {
      return;
    }
    if (parent.type === "custom") {
      parent.slot = getSlot(child);
    }
    if (parent.type === "fragment") {
      // TODO: could optimize something?
      let slot: HNode | undefined;
      for (const c of parent.children) {
        slot = getSlotForNext(c, slot);
      }
      parent.slot = slot;
    }
    child = parent;
    parent = child.parent;
  }
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
  slot?: HNode; // last HNode included inside the subtree
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

// "slot" is the last HNode inside the BNode subtree
function getSlot(node: BNode): HNode | undefined {
  if (node.type === "empty") {
    return;
  }
  if (node.type === "tag" || node.type === "text") {
    return node.hnode;
  }
  return node.slot;
}

// convenient wrapper to progress slot while looping children
function getSlotForNext(
  node: BNode,
  preSlot: HNode | undefined
): HNode | undefined {
  const slot = getSlot(node);
  return slot ? slot : preSlot;
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
