import { tinyassert } from "@hiogawa/utils";
import { HookContext } from "./hooks";
import { isEqualShallow } from "./utils";
import {
  type BCustom,
  type BFragment,
  type BNode,
  type BTag,
  type BText,
  EMPTY_NODE,
  type HNode,
  NODE_TYPE_CUSTOM,
  NODE_TYPE_EMPTY,
  NODE_TYPE_FRAGMENT,
  NODE_TYPE_TAG,
  NODE_TYPE_TEXT,
  type NodeKey,
  type Props,
  type VCustom,
  type VNode,
  getBNodeKey,
  getBNodeParent,
  getBNodeRange,
  getBNodeSlot,
  getVNodeKey,
  setBNodeParent,
} from "./virtual-dom";

export function render(
  vnode: VNode,
  parent: HNode,
  bnode: BNode = EMPTY_NODE,
  hydration: boolean = false
) {
  const effectManager = new EffectManager();
  const newBnode = reconcileNode(
    vnode,
    bnode,
    parent,
    null,
    effectManager,
    hydration
  );
  effectManager.run();
  return newBnode;
}

export function hydrate(vnode: VNode, parent: HNode) {
  return render(vnode, parent, undefined, true);
}

// Recursively traverse VNode with simple switch by VNode.type.
// Each case has either "mutating" or "mounting" reconcilation path.
// For "mutating" path, input BNode is mutated.
// For "mounting" path, new BNode is created and returned.
// Hydration will mimic "mutating" path by (partially) creating expected BNode.
function reconcileNode(
  vnode: VNode,
  bnode: BNode,
  hparent: HNode,
  hnextSibling: HNode | null,
  effectManager: EffectManager,
  isHydrate: boolean
): BNode {
  if (isHydrate) {
    tinyassert(bnode.type === NODE_TYPE_EMPTY);
    bnode = hydrateNode(vnode, hparent, hnextSibling);
    hnextSibling = getBNodeSlot(bnode) ?? hnextSibling;
  }
  if (vnode.type === NODE_TYPE_EMPTY) {
    if (bnode.type === NODE_TYPE_EMPTY) {
    } else {
      unmount(bnode);
      bnode = EMPTY_NODE;
    }
  } else if (vnode.type === NODE_TYPE_TAG) {
    let queueRef = isHydrate; // ref callback on mount or hydrate;
    if (
      bnode.type === NODE_TYPE_TAG &&
      bnode.vnode.key === vnode.key &&
      bnode.vnode.ref === vnode.ref &&
      bnode.vnode.name === vnode.name
    ) {
      if (isHydrate) {
        hydrateTagProps(bnode, vnode.props);
      } else {
        reconcileTagProps(bnode, vnode.props, bnode.vnode.props);
      }
      bnode.vnode = vnode;
      bnode.child = reconcileNode(
        vnode.child,
        bnode.child,
        bnode.hnode,
        null,
        effectManager,
        isHydrate
      );
      placeChild(hparent, bnode.hnode, hnextSibling, false);
    } else {
      queueRef = true;
      unmount(bnode);
      const hnode = document.createElement(vnode.name);
      const child = reconcileNode(
        vnode.child,
        EMPTY_NODE,
        hnode,
        null,
        effectManager,
        isHydrate
      );
      bnode = {
        type: vnode.type,
        vnode,
        child,
        hnode,
        listeners: new Map(),
      } satisfies BTag;
      reconcileTagProps(bnode, vnode.props, {});
      placeChild(hparent, bnode.hnode, hnextSibling, true);
    }
    if (queueRef) {
      effectManager.refNodes.push(bnode);
    }
    setBNodeParent(bnode.child, bnode);
  } else if (vnode.type === NODE_TYPE_TEXT) {
    if (bnode.type === NODE_TYPE_TEXT) {
      if (bnode.vnode.data !== vnode.data) {
        bnode.hnode.data = vnode.data;
      }
      bnode.vnode = vnode;
      placeChild(hparent, bnode.hnode, hnextSibling, false);
    } else {
      unmount(bnode);
      const hnode = document.createTextNode(vnode.data);
      bnode = {
        type: vnode.type,
        vnode,
        hnode,
      } satisfies BText;
      placeChild(hparent, bnode.hnode, hnextSibling, true);
    }
  } else if (vnode.type === NODE_TYPE_FRAGMENT) {
    // TODO: learn from
    // https://github.com/yewstack/yew/blob/30e2d548ef57a4b738fb285251b986467ef7eb95/packages/yew/src/dom_bundle/blist.rs#L416
    // https://github.com/snabbdom/snabbdom/blob/420fa78abe98440d24e2c5af2f683e040409e0a6/src/init.ts#L289
    // https://github.com/WebReflection/udomdiff/blob/8923d4fac63a40c72006a46eb0af7bfb5fdef282/index.js
    let isReordering = false;
    if (bnode.type === NODE_TYPE_FRAGMENT && bnode.vnode.key === vnode.key) {
      const [newChildren, oldChildren] = alignChildrenByKey(
        vnode.children,
        bnode.children
      );
      if (!isEqualShallow(bnode.children, newChildren)) {
        isReordering = true;
        bnode.children = newChildren;
      }
      for (const bnode of oldChildren) {
        unmount(bnode);
      }
      bnode.vnode = vnode;
    } else {
      unmount(bnode);
      bnode = {
        type: vnode.type,
        vnode,
        children: [],
        parent: undefined,
        slot: undefined,
      } satisfies BFragment;
    }
    // unmount excess bnode.children
    const bchildren = bnode.children;
    for (const bchild of bchildren.slice(vnode.children.length)) {
      unmount(bchild);
    }
    // reconcile vnode.children
    bnode.slot = undefined;
    bnode.hrange = undefined;
    for (let i = vnode.children.length - 1; i >= 0; i--) {
      const bchild = reconcileNode(
        vnode.children[i],
        bchildren[i] ?? EMPTY_NODE,
        hparent,
        hnextSibling,
        effectManager,
        isHydrate
      );
      const hrange = getBNodeRange(bchild);
      if (hrange) {
        if (!bnode.hrange) {
          bnode.hrange = [...hrange];
        } else {
          bnode.hrange[0] = hrange[0];
        }
        if (isReordering) {
          // TODO: this should replace each `placeChild` when mutating VTag, VText
          // TODO: slot-fixup in updateCustomNode also has to be adjusted
          // placeBNode(bchild, hparent, hnextSibling);
          placeBNode;
        }
      }
      hnextSibling = getBNodeSlot(bchild) ?? hnextSibling;
      bnode.slot = getBNodeSlot(bchild) ?? bnode.slot;
      bnode.children[i] = bchild;
      setBNodeParent(bchild, bnode);
    }
  } else if (vnode.type === NODE_TYPE_CUSTOM) {
    if (
      bnode.type === NODE_TYPE_CUSTOM &&
      bnode.vnode.key === vnode.key &&
      bnode.vnode.render === vnode.render
    ) {
      bnode.hookContext.notify = updateCustomNodeUnsupported;
      const vchild = bnode.hookContext.wrap(() => vnode.render(vnode.props));
      bnode.child = reconcileNode(
        vchild,
        bnode.child,
        hparent,
        hnextSibling,
        effectManager,
        isHydrate
      );
      bnode.vnode = vnode;
    } else {
      unmount(bnode);
      const hookContext = new HookContext(updateCustomNodeUnsupported);
      const vchild = hookContext.wrap(() => vnode.render(vnode.props));
      const child = reconcileNode(
        vchild,
        EMPTY_NODE,
        hparent,
        hnextSibling,
        effectManager,
        isHydrate
      );
      bnode = {
        type: vnode.type,
        vnode,
        child,
        hookContext,
        hparent: undefined,
        parent: undefined,
        slot: undefined,
      } satisfies BCustom;
    }
    bnode.hparent = hparent;
    setBNodeParent(bnode.child, bnode);
    bnode.slot = getBNodeSlot(bnode.child);
    bnode.hrange = getBNodeRange(bnode.child);
    effectManager.effectNodes.push(bnode);

    // expose self re-rendering for hooks
    const bcustom = bnode; // type-guard
    bnode.hookContext.notify = () => {
      updateCustomNode(vnode, bcustom);
    };
  } else {
    vnode satisfies never;
  }
  return bnode;
}

function hydrateNode(
  vnode: VNode,
  hparent: HNode,
  hnextSibling: HNode | null
): BNode {
  if (vnode.type === NODE_TYPE_EMPTY) {
    return EMPTY_NODE;
  } else if (vnode.type === NODE_TYPE_TAG) {
    const hnode = hnextSibling?.previousSibling ?? hparent.lastChild;
    // TODO: warning instead of hard error?
    // TODO: check props mismatch?
    tinyassert(
      hnode instanceof Element && hnode.tagName.toLowerCase() === vnode.name,
      `tag hydration mismatch (actual: '${hnode?.nodeName}', expected: '${vnode.name}')`
    );
    return {
      type: vnode.type,
      vnode,
      child: EMPTY_NODE,
      hnode,
      listeners: new Map(),
    } satisfies BTag;
  } else if (vnode.type === NODE_TYPE_TEXT) {
    const hnode = hnextSibling?.previousSibling ?? hparent.lastChild;
    tinyassert(
      hnode instanceof Text,
      `text hydration mismatch (actual: '${hnode?.nodeName}', expected: '#text')`
    );
    tinyassert(
      hnode.data === vnode.data,
      `text hydration mismatch (actual: '${hnode.data}', expected: '${vnode.data}')`
    );
    return { type: vnode.type, vnode, hnode } satisfies BText;
  } else if (vnode.type === NODE_TYPE_FRAGMENT) {
    return { type: vnode.type, vnode, children: [] } satisfies BFragment;
  } else if (vnode.type === NODE_TYPE_CUSTOM) {
    return {
      type: vnode.type,
      vnode,
      child: EMPTY_NODE,
      hookContext: new HookContext(updateCustomNodeUnsupported),
      hparent: undefined,
      parent: undefined,
      slot: undefined,
    } satisfies BCustom;
  }
  return vnode satisfies never;
}

// TODO: should use it only for "mounting" case
function placeChild(
  hparent: HNode,
  hnode: HNode,
  hnextSibling: HNode | null,
  isMount: boolean
) {
  if (isMount || hnode.nextSibling !== hnextSibling) {
    hparent.insertBefore(hnode, hnextSibling);
  }
}

function placeChildrenRange(
  first: HNode,
  last: HNode,
  hparent: HNode,
  hnextSibling: HNode | null
) {
  let hnode = last;
  while (true) {
    hparent.insertBefore(hnode, hnextSibling);
    if (first === hnode) {
      break;
    }
    hnextSibling = hnode;
    tinyassert(hnode.previousSibling);
    hnode = hnode.previousSibling;
  }
}

function placeBNode(bnode: BNode, hparent: HNode, hnextSibling: HNode | null) {
  const hrange = getBNodeRange(bnode);
  if (hrange) {
    placeChildrenRange(hrange[0], hrange[1], hparent, hnextSibling);
  }
}

export function updateCustomNodeUnsupported() {
  throw new Error("Unsupported force-update during render");
}

// update Custom node on its own (aka component re-rendering)
// exported for unit test
export function updateCustomNode(vnode: VCustom, bnode: BCustom) {
  // multiple forceUpdate can make bnode unmounted
  if (!bnode.hparent) {
    return;
  }

  const oldSlot = getBNodeSlot(bnode);
  const oldRange = getBNodeRange(bnode);

  // traverse ancestors to find "slot"
  const hnextSibling = findNextSibling(bnode);

  // reconcile
  const effectManager = new EffectManager();
  const newBnode = reconcileNode(
    vnode,
    bnode,
    bnode.hparent,
    hnextSibling ?? null,
    effectManager,
    false
  );
  tinyassert(newBnode === bnode); // reconciled over itself without unmount (i.e. should be same `key` and `render`)

  // fix up ancestors range
  const newRange = getBNodeRange(bnode);
  if (
    oldRange !== newRange ||
    (oldRange && newRange && !isEqualShallow(oldRange, newRange))
  ) {
    updateParentRange(bnode);
  }

  // fix up ancestors slot
  const newSlot = getBNodeSlot(bnode);
  if (oldSlot !== newSlot) {
    updateParentSlot(bnode);
  }

  effectManager.run();
}

function findNextSibling(child: BNode): HNode | undefined {
  let parent = getBNodeParent(child);
  while (parent) {
    if (parent.type === NODE_TYPE_TAG) {
      // no slot i.e. new node will be the first child within parent tag
      return;
    }
    if (parent.type === NODE_TYPE_FRAGMENT) {
      // TODO
      // need faster look up within BFragment.children?
      // though this wouldn't be so bad practically since we traverse up to only first BTag ancestor
      let slot: HNode | undefined;
      for (let i = parent.children.length - 1; i >= 0; i--) {
        const c = parent.children[i];
        if (c === child) {
          // otherwise it didn't find previous slot within the fragment
          // so give up and go up to next parent
          if (slot) {
            return slot;
          }
          break;
        }
        slot = getBNodeSlot(c) ?? slot;
      }
    }
    // go up to parent also when parent.type === "custom"
    child = parent;
    parent = child.parent;
  }
  return;
}

function updateParentSlot(child: BNode) {
  let parent = getBNodeParent(child);
  while (parent) {
    if (parent.type === NODE_TYPE_TAG) {
      return;
    }
    if (parent.type === NODE_TYPE_CUSTOM) {
      parent.slot = getBNodeSlot(child);
    }
    if (parent.type === NODE_TYPE_FRAGMENT) {
      // TODO: could optimize something?
      let slot: HNode | undefined;
      for (const c of parent.children) {
        slot = getBNodeSlot(c) ?? slot;
      }
      parent.slot = slot;
    }
    child = parent;
    parent = child.parent;
  }
}

function updateParentRange(child: BNode) {
  let parent = getBNodeParent(child);
  while (parent) {
    if (parent.type === NODE_TYPE_TAG) {
      return;
    }
    if (parent.type === NODE_TYPE_CUSTOM) {
      parent.hrange = getBNodeRange(child);
    }
    if (parent.type === NODE_TYPE_FRAGMENT) {
      parent.hrange = undefined;
      for (const c of parent.children) {
        const hrange = getBNodeRange(c);
        if (hrange) {
          if (!parent.hrange) {
            parent.hrange = [...hrange];
          } else {
            parent.hrange[0] = hrange[0];
          }
        }
      }
    }
    child = parent;
    parent = child.parent;
  }
}

function alignChildrenByKey(
  vnodes: VNode[],
  bnodes: BNode[]
): [BNode[], BNode[]] {
  const keyMap = new Map<NodeKey, number>();

  vnodes.forEach((vnode, i) => {
    const key = getVNodeKey(vnode);
    if (typeof key !== "undefined") {
      keyMap.set(key, i);
    }
  });

  // for now, handle only when all nodes have keys
  if (keyMap.size !== vnodes.length) {
    return [bnodes, []];
  }

  const newBnodes: BNode[] = vnodes.map(() => EMPTY_NODE);
  const oldBnodes: BNode[] = [];

  for (const bnode of bnodes) {
    const key = getBNodeKey(bnode);
    if (typeof key !== "undefined") {
      const i = keyMap.get(key);
      if (typeof i !== "undefined") {
        newBnodes[i] = bnode;
        continue;
      }
    }
    oldBnodes.push(bnode);
  }

  return [newBnodes, oldBnodes];
}

// cf.
// https://github.com/preactjs/preact/blame/08b07ccea62bfdb44b983bfe69ae73eb5e4f43c7/src/diff/props.js#L17-L29
// https://github.com/preactjs/preact/blob/08b07ccea62bfdb44b983bfe69ae73eb5e4f43c7/compat/src/render.js#L114
// https://github.com/ryansolid/dom-expressions/blob/a2bd455055f5736bb591abe69a5f5b52568b9ea6/packages/babel-plugin-jsx-dom-expressions/src/dom/element.js#L219-L246
// https://github.com/ryansolid/dom-expressions/blob/a2bd455055f5736bb591abe69a5f5b52568b9ea6/packages/dom-expressions/src/constants.js#L30-L39
function reconcileTagProps(bnode: BTag, props: Props, oldProps: Props) {
  for (const k in oldProps) {
    if (!(k in props)) {
      setTagProp(bnode, k, null);
    }
  }
  for (const k in props) {
    if (props[k] !== oldProps[k]) {
      setTagProp(bnode, k, props[k]);
    }
  }
}

function hydrateTagProps(bnode: BTag, props: Props) {
  // TODO: check props mismatch?
  for (const key in props) {
    if (key.startsWith("on")) {
      setTagProp(bnode, key, props[key]);
    }
  }
}

function setTagProp(bnode: BTag, key: string, value: unknown) {
  const { listeners, hnode } = bnode;

  if (key.startsWith("on")) {
    const eventType = key.slice(2).toLowerCase();
    const listener = listeners.get(eventType);
    if (listener) {
      hnode.removeEventListener(eventType, listener);
    }
    if (value != null) {
      tinyassert(
        typeof value === "function",
        `Invalid event listener prop for '${eventType}'`
      );
      listeners.set(eventType, value as any);
      hnode.addEventListener(eventType, value as any);
    }
    return;
  }

  // TODO: support defalutValue?
  if (key in hnode) {
    try {
      (hnode as any)[key] = value != null ? value : "";
      return;
    } catch {}
  }

  if (value != null) {
    hnode.setAttribute(key, value as any);
  } else {
    hnode.removeAttribute(key);
  }
}

function unmount(bnode: BNode) {
  return unmountNode(bnode, false);
}

function unmountNode(bnode: BNode, skipRemove: boolean) {
  if (bnode.type === NODE_TYPE_EMPTY) {
    return;
  } else if (bnode.type === NODE_TYPE_TAG) {
    // skipRemove children since parent will detach subtree
    unmountNode(bnode.child, /* skipRemove */ true);
    if (!skipRemove) {
      bnode.hnode.remove();
      bnode.vnode.ref?.(null);
    }
  } else if (bnode.type === NODE_TYPE_TEXT) {
    bnode.hnode.remove();
  } else if (bnode.type === NODE_TYPE_FRAGMENT) {
    for (const child of bnode.children) {
      unmountNode(child, skipRemove);
    }
  } else if (bnode.type === NODE_TYPE_CUSTOM) {
    bnode.hookContext.cleanupEffect("layout-effect");
    bnode.hookContext.cleanupEffect("effect");
    bnode.hparent = undefined;
    unmountNode(bnode.child, skipRemove);
  } else {
    bnode satisfies never;
  }
}

// single instance per `render` and only `run` once
class EffectManager {
  // TODO: effect ordering? (currently DFS exit time ordering)
  refNodes: BTag[] = [];
  effectNodes: BCustom[] = [];

  run() {
    // TODO: node could be already unmounted?
    for (const tagNode of this.refNodes) {
      if (tagNode.vnode.ref) {
        tagNode.vnode.ref(tagNode.hnode);
      }
    }

    for (const customNode of this.effectNodes) {
      customNode.hookContext.runEffect("layout-effect");
    }

    // TODO: is it robust against multiple synchronous render?
    requestAnimationFrame(() => {
      for (const customNode of this.effectNodes) {
        if (customNode.hparent) {
          customNode.hookContext.runEffect("effect");
        }
      }
    });
  }
}
