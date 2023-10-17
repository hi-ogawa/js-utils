import { tinyassert } from "@hiogawa/utils";
import { HookContext } from "./hooks";
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
  getBNodeSlot,
  getVNodeKey,
  setBNodeParent,
} from "./virtual-dom";

export function render(vnode: VNode, parent: HNode, bnode?: BNode) {
  const effectManager = new EffectManager();
  const newBnode = reconcileNode(
    vnode,
    bnode ?? EMPTY_NODE,
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
  // switch by vnode.type, then in each case, another branch to whether mutate or re-mount
  if (vnode.type === NODE_TYPE_EMPTY) {
    if (bnode.type === NODE_TYPE_EMPTY) {
    } else {
      unmount(bnode);
      bnode = EMPTY_NODE;
    }
  } else if (vnode.type === NODE_TYPE_TAG) {
    if (bnode.type === NODE_TYPE_TAG && bnode.vnode === vnode) {
      // TODO: is it correct since immutable? but then isn't this effective only for `memo` component?
      // TODO: how about effect or custom component inside? (probably okay since custom component is supposed to re-render itself)
      // TODO: can we generalize this to all node types? (probably so)
      // TODO: can we also skip `placeChild`? (probably not. ideally for mutating path, child placing should be managed by "caller-side" e.g. Fragment?)
      placeChild(bnode.hnode, hparent, preSlot, false);
    } else if (
      bnode.type === NODE_TYPE_TAG &&
      bnode.vnode.key === vnode.key &&
      bnode.vnode.ref === vnode.ref &&
      bnode.vnode.name === vnode.name
    ) {
      reconcileTagProps(bnode, vnode.props, bnode.vnode.props);
      bnode.vnode = vnode;
      bnode.child = reconcileNode(
        vnode.child,
        bnode.child,
        bnode.hnode,
        undefined,
        effectManager
      );
      bnode.vnode = vnode;
      placeChild(bnode.hnode, hparent, preSlot, false);
    } else {
      unmount(bnode);
      const hnode = document.createElement(vnode.name);
      const child = reconcileNode(
        vnode.child,
        EMPTY_NODE,
        hnode,
        undefined,
        effectManager
      );
      bnode = {
        type: vnode.type,
        vnode,
        child,
        hnode,
        listeners: new Map(),
      } satisfies BTag;
      reconcileTagProps(bnode, vnode.props, {});
      placeChild(bnode.hnode, hparent, preSlot, true);
      effectManager.refNodes.push(bnode);
    }
    setBNodeParent(bnode.child, bnode);
  } else if (vnode.type === NODE_TYPE_TEXT) {
    if (bnode.type === NODE_TYPE_TEXT) {
      if (bnode.vnode.data !== vnode.data) {
        bnode.hnode.data = vnode.data;
      }
      bnode.vnode = vnode;
      placeChild(bnode.hnode, hparent, preSlot, false);
    } else {
      unmount(bnode);
      const hnode = document.createTextNode(vnode.data);
      bnode = {
        type: vnode.type,
        vnode,
        hnode,
      } satisfies BText;
      placeChild(bnode.hnode, hparent, preSlot, true);
    }
  } else if (vnode.type === NODE_TYPE_FRAGMENT) {
    // TODO: learn from
    // https://github.com/yewstack/yew/blob/30e2d548ef57a4b738fb285251b986467ef7eb95/packages/yew/src/dom_bundle/blist.rs#L416
    // https://github.com/snabbdom/snabbdom/blob/420fa78abe98440d24e2c5af2f683e040409e0a6/src/init.ts#L289
    // https://github.com/WebReflection/udomdiff/blob/8923d4fac63a40c72006a46eb0af7bfb5fdef282/index.js
    if (bnode.type === NODE_TYPE_FRAGMENT && bnode.vnode.key === vnode.key) {
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
    for (let i = 0; i < vnode.children.length; i++) {
      const bchild = reconcileNode(
        vnode.children[i],
        bchildren[i] ?? EMPTY_NODE,
        hparent,
        preSlot,
        effectManager
      );
      preSlot = getBNodeSlot(bchild) ?? preSlot;
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
        preSlot,
        effectManager
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
        preSlot,
        effectManager
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
  const newSlot = getBNodeSlot(bnode);
  if (oldSlot !== newSlot) {
    updateParentSlot(bnode);
  }

  effectManager.run();
}

function findPreviousSlot(child: BNode): HNode | undefined {
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
      for (const c of parent.children) {
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

function alignChildrenByKey(
  vnodes: VNode[],
  bnodes: BNode[]
): [BNode[], BNode[]] {
  const keyMap = new Map<NodeKey, number>();

  for (let i = 0; i < vnodes.length; i++) {
    const key = getVNodeKey(vnodes[i]);
    if (typeof key !== "undefined" && !keyMap.has(key)) {
      keyMap.set(key, i);
    } else {
      // give up if no nodes are not fully uniquely keyed
      return [bnodes, []];
    }
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
  if (props === oldProps) {
    return;
  }
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
