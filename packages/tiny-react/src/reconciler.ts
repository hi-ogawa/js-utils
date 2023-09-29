import { tinyassert } from "@hiogawa/utils";
import { HookContext } from "./hooks";
import {
  type BCustom,
  type BFragment,
  type BNode,
  type BTag,
  type BText,
  type HNode,
  type NodeKey,
  type Props,
  type VCustom,
  type VNode,
  emptyNode,
  getNodeKey,
  getSlot,
} from "./virtual-dom";

export function render(vnode: VNode, parent: HNode, bnode?: BNode) {
  const effectManager = new EffectManager();
  const newBnode = reconcileNode(
    vnode,
    bnode ?? emptyNode(),
    parent,
    undefined,
    effectManager
  );
  effectManager.run();
  return newBnode;
}

function reconcileNode(
  vnode: VNode,
  bnode: BNode, // mutated when reconciled over same bnode
  hparent: HNode,
  preSlot: HNode | undefined,
  effectManager: EffectManager
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
        bnode.ref === vnode.ref &&
        bnode.name === vnode.name
      ) {
        reconcileTagProps(bnode, vnode.props, bnode.props);
        bnode.props = vnode.props;
        bnode.child = reconcileNode(
          vnode.child,
          bnode.child,
          bnode.hnode,
          undefined,
          effectManager
        );
        placeChild(bnode.hnode, hparent, preSlot, false);
      } else {
        unmount(bnode);
        const hnode = document.createElement(vnode.name);
        const child = reconcileNode(
          vnode.child,
          emptyNode(),
          hnode,
          undefined,
          effectManager
        );
        bnode = { ...vnode, child, hnode, listeners: new Map() } satisfies BTag;
        reconcileTagProps(bnode, vnode.props, {});
        placeChild(bnode.hnode, hparent, preSlot, true);
        effectManager.queueRef(bnode);
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
      // https://github.com/WebReflection/udomdiff/blob/8923d4fac63a40c72006a46eb0af7bfb5fdef282/index.js
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
      bnode.slot = undefined;
      for (let i = 0; i < vnode.children.length; i++) {
        const bchild = reconcileNode(
          vnode.children[i],
          bchildren[i] ?? emptyNode(),
          hparent,
          preSlot,
          effectManager
        );
        preSlot = getSlot(bchild) ?? preSlot;
        bnode.slot = getSlot(bchild) ?? bnode.slot;
        bnode.children[i] = bchild;
        bchild.parent = bnode;
      }
      break;
    }
    case "custom": {
      if (
        bnode.type === "custom" &&
        bnode.key === vnode.key &&
        bnode.render === vnode.render
      ) {
        const vchild = bnode.hookContext.wrap(() => vnode.render(vnode.props));
        bnode.child = reconcileNode(
          vchild,
          bnode.child,
          hparent,
          preSlot,
          effectManager
        );
        bnode.props = vnode.props;
        bnode.hparent = hparent;
      } else {
        unmount(bnode);
        const hookContext = new HookContext(forceUpdate);
        const vchild = hookContext.wrap(() => vnode.render(vnode.props));
        const child = reconcileNode(
          vchild,
          emptyNode(),
          hparent,
          preSlot,
          effectManager
        );
        bnode = { ...vnode, child, hparent, hookContext } satisfies BCustom;
      }
      bnode.child.parent = bnode;
      bnode.slot = getSlot(bnode.child);
      effectManager.queueEffect(bnode);

      // expose re-rendering trigger via hooks
      // (this doesn't support setState while render)
      const vcustom = vnode;
      const bcustom = bnode;
      function forceUpdate() {
        rerenderCustomNode(vcustom, bcustom);
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
  const slotNext = preSlot ? preSlot.nextSibling : hparent.firstChild;
  if (init || !(hnode === slotNext || hnode.nextSibling === slotNext)) {
    hparent.insertBefore(hnode, slotNext);
  }
}

// export for unit test
export function rerenderCustomNode(vnode: VCustom, bnode: BCustom) {
  const oldSlot = getSlot(bnode);

  // traverse ancestors to find "slot"
  const preSlot = findPreviousSlot(bnode);

  // reconcile
  const effectManager = new EffectManager();
  const newBnode = reconcileNode(
    vnode,
    bnode,
    bnode.hparent,
    preSlot,
    effectManager
  );
  tinyassert(newBnode === bnode); // reconciled over itself without unmount (i.e. should be same `key` and `render`)

  // fix up ancestors slot
  const newSlot = getSlot(bnode);
  if (oldSlot !== newSlot) {
    updateParentSlot(bnode);
  }

  effectManager.run();
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
        slot = getSlot(c) ?? slot;
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
        slot = getSlot(c) ?? slot;
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
  return unmountNode(bnode, false);
}

function unmountNode(bnode: BNode, skipRemove: boolean) {
  switch (bnode.type) {
    case "empty": {
      break;
    }
    case "tag": {
      // skipRemove children since parent will detach subtree
      unmountNode(bnode.child, /* skipRemove */ true);
      if (!skipRemove) {
        bnode.hnode.remove();
        bnode.ref?.(null);
      }
      break;
    }
    case "text": {
      bnode.hnode.remove();
      break;
    }
    case "fragment": {
      for (const child of bnode.children) {
        unmountNode(child, skipRemove);
      }
      break;
    }
    case "custom": {
      bnode.hookContext.cleanupEffect();
      unmountNode(bnode.child, skipRemove);
      break;
    }
  }
}

class EffectManager {
  private refs: (() => void)[] = [];
  private effects: (() => void)[] = [];

  queueRef(bnode: BTag) {
    const { ref, hnode } = bnode;
    if (ref) {
      this.refs.push(() => ref(hnode));
    }
  }

  queueEffect(node: BCustom) {
    this.effects.push(() => node.hookContext.runEffect());
  }

  run() {
    this.refs.forEach((f) => f());
    this.refs = [];

    // TODO: traverses all hooks of all custom nodes. probably can optimize.
    this.effects.forEach((f) => f());
    this.effects = [];
  }
}