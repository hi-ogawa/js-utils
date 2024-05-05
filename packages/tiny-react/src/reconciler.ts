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
  type VCustom,
  type VNode,
  type VTag,
  getBNodeKey,
  getBNodeParent,
  getBNodeRange,
  getVNodeKey,
  isReservedTagProp,
  normalizeComponentChildren,
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
  }
  if (vnode.type === NODE_TYPE_EMPTY) {
    //
    // empty
    //
    if (bnode.type === NODE_TYPE_EMPTY) {
    } else {
      unmount(bnode);
      bnode = EMPTY_NODE;
    }
  } else if (vnode.type === NODE_TYPE_TAG) {
    //
    // tag
    //
    let queueRef = isHydrate; // ref callback on mount or hydrate;
    if (
      bnode.type === NODE_TYPE_TAG &&
      bnode.vnode.key === vnode.key &&
      bnode.vnode.name === vnode.name &&
      bnode.vnode.props.ref === vnode.props.ref
    ) {
      if (isHydrate) {
        hydrateTagProps(bnode, vnode.props);
      } else {
        reconcileTagProps(bnode, vnode.props, bnode.vnode.props);
      }
      bnode.vnode = vnode;
      bnode.child = reconcileNode(
        normalizeComponentChildren(vnode.props.children),
        bnode.child,
        bnode.hnode,
        null,
        effectManager,
        isHydrate
      );
    } else {
      queueRef = true;
      unmount(bnode);
      const hnode = document.createElement(vnode.name);
      const child = reconcileNode(
        normalizeComponentChildren(vnode.props.children),
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
      hparent.insertBefore(hnode, hnextSibling);
    }
    if (queueRef) {
      effectManager.refNodes.push(bnode);
    }
    setBNodeParent(bnode.child, bnode);
  } else if (vnode.type === NODE_TYPE_TEXT) {
    //
    // text
    //
    if (bnode.type === NODE_TYPE_TEXT) {
      if (bnode.vnode.data !== vnode.data) {
        bnode.hnode.data = vnode.data;
      }
      bnode.vnode = vnode;
    } else {
      unmount(bnode);
      const hnode = document.createTextNode(vnode.data);
      bnode = {
        type: vnode.type,
        vnode,
        hnode,
      } satisfies BText;
      hparent.insertBefore(hnode, hnextSibling);
    }
  } else if (vnode.type === NODE_TYPE_FRAGMENT) {
    //
    // fragment
    //
    let isMutation = false;
    if (bnode.type === NODE_TYPE_FRAGMENT && bnode.vnode.key === vnode.key) {
      isMutation = true;
      const [newChildren, oldChildren] = alignChildrenByKey(
        vnode.children,
        bnode.children
      );
      bnode.children = newChildren;
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
        parent: null,
        hrange: null,
      } satisfies BFragment;
    }
    // reconcile vnode.children
    bnode.hrange = null;
    for (let i = vnode.children.length - 1; i >= 0; i--) {
      const bchild = reconcileNode(
        vnode.children[i],
        bnode.children[i] ?? EMPTY_NODE,
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
        if (isMutation) {
          reinsertHNodeRange(hrange, hparent, hnextSibling);
        }
        hnextSibling = hrange[0];
      }
      bnode.children[i] = bchild;
      setBNodeParent(bchild, bnode);
    }
  } else if (vnode.type === NODE_TYPE_CUSTOM) {
    //
    // custom
    //
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
        hrange: null,
        hparent: null,
        parent: null,
      } satisfies BCustom;
    }
    setBNodeParent(bnode.child, bnode);
    bnode.hparent = hparent;
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

// TODO: check excess nodes during SSR?
function hydrateNode(
  vnode: VNode,
  hparent: HNode,
  hnextSibling: HNode | null
): BNode {
  if (vnode.type === NODE_TYPE_EMPTY) {
    //
    // empty
    //
    return EMPTY_NODE;
  } else if (vnode.type === NODE_TYPE_TAG) {
    //
    // tag
    //
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
    //
    // text
    //
    let hnode = hnextSibling?.previousSibling ?? hparent.lastChild;
    // no text node for empty text during SSR
    if (hnode === null && vnode.data === "") {
      return EMPTY_NODE;
    }
    // split concatenated single text during SSR
    // (is this what preact does? https://github.com/preactjs/preact/blob/f96350987873bd4082c347cbc00cdc43ebfd0b4e/src/diff/index.js#L419)
    if (
      hnode instanceof Text &&
      hnode.data.length > vnode.data.length &&
      hnode.data.endsWith(vnode.data)
    ) {
      hparent.insertBefore(
        document.createTextNode(hnode.data.slice(0, -vnode.data.length)),
        hnode
      );
      hnode.data = vnode.data;
    }
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
    //
    // fragment
    //
    return {
      type: vnode.type,
      vnode,
      children: [],
      parent: null,
      hrange: null,
    } satisfies BFragment;
  } else if (vnode.type === NODE_TYPE_CUSTOM) {
    //
    // custom
    //
    return {
      type: vnode.type,
      vnode,
      child: EMPTY_NODE,
      hookContext: new HookContext(updateCustomNodeUnsupported),
      hparent: null,
      hrange: null,
      parent: null,
    } satisfies BCustom;
  }
  return vnode satisfies never;
}

function reinsertHNodeRange(
  hrange: [HNode, HNode],
  hparent: HNode,
  hnextSibling: HNode | null
) {
  let [first, hnode] = hrange;
  if (hnode.nextSibling !== hnextSibling) {
    while (true) {
      // keep `previousSibling` before `insertBefore`
      const prev = hnode.previousSibling;
      hparent.insertBefore(hnode, hnextSibling);
      if (hnode === first) {
        break;
      }
      tinyassert(prev);
      hnextSibling = hnode;
      hnode = prev;
    }
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

  const oldRange = getBNodeRange(bnode);

  // traverse ancestors to find "slot"
  const hnextSibling = findNextSibling(bnode);

  // reconcile
  const effectManager = new EffectManager();
  const newBnode = reconcileNode(
    vnode,
    bnode,
    bnode.hparent,
    hnextSibling,
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

  effectManager.run();
}

function findNextSibling(child: BNode): HNode | null {
  let parent = getBNodeParent(child);
  while (parent) {
    if (parent.type === NODE_TYPE_TAG) {
      // new node will be the first child within parent tag
      return null;
    }
    if (parent.type === NODE_TYPE_FRAGMENT) {
      let hnode: HNode | undefined;
      for (let i = parent.children.length - 1; i >= 0; i--) {
        const c = parent.children[i];
        if (c === child) {
          // otherwise it didn't find previous slot within the fragment
          // so give up and go up to next parent
          if (hnode) {
            return hnode;
          }
          break;
        }
        const hrange = getBNodeRange(c);
        if (hrange) {
          hnode = hrange[0];
        }
      }
    }
    // go up to parent also when parent.type === "custom"
    child = parent;
    parent = child.parent;
  }
  return null;
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
      parent.hrange = null;
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
    return [bnodes.slice(0, vnodes.length), bnodes.slice(vnodes.length)];
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
function reconcileTagProps(
  bnode: BTag,
  props: VTag["props"],
  oldProps: VTag["props"]
) {
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

function hydrateTagProps(bnode: BTag, props: VTag["props"]) {
  // TODO: check props mismatch?
  for (const key in props) {
    if (key.startsWith("on")) {
      setTagProp(bnode, key, props[key]);
    }
  }
}

function setTagProp(bnode: BTag, key: string, value: unknown) {
  if (isReservedTagProp(key)) {
    return;
  }
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
      if (bnode.vnode.props.ref) {
        bnode.vnode.props.ref(null);
      }
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
    bnode.hparent = null;
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
      if (tagNode.vnode.props.ref) {
        tagNode.vnode.props.ref(tagNode.hnode);
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
