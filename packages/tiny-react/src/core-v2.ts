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
      // TODO: learn from
      // https://github.com/yewstack/yew/blob/30e2d548ef57a4b738fb285251b986467ef7eb95/packages/yew/src/dom_bundle/blist.rs#L416
      // https://github.com/snabbdom/snabbdom/blob/420fa78abe98440d24e2c5af2f683e040409e0a6/src/init.ts#L289
      let moves: [number, number][] | undefined;
      if (bnode.type === "fragment" && bnode.key === vnode.key) {
        moves = moveBnodesByKey(vnode.children, bnode.children);
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
      // TODO
      // this would not be so easy since each bchild doesn't necessary contribute to single host node (e.g. empty, fragment, custom)
      // probably, each bchild needs to track the range of affecting host nodes under parent.
      if (moves) {
        // TODO: no way this is a right way to move child nodes...
        const oldChildNodes = range(parent.childNodes.length).map(
          (i) => parent.childNodes[i]
        );
        const newChildNodes = [...oldChildNodes];
        for (const [from, to] of moves) {
          newChildNodes[to] = oldChildNodes[from];
        }
        for (const child of newChildNodes) {
          child.remove();
        }
        for (const child of newChildNodes) {
          parent.append(child);
        }
      }
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

function moveBnodesByKey(
  vchildren: VNode[],
  bchildren: BNode[] // mutated
) {
  const bKeyIndex = new Map<NodeKey, number>();
  bchildren.forEach((bchild, i) => {
    const bkey = getNodeKey(bchild);
    if (typeof bkey !== "undefined") {
      bKeyIndex.set(bkey, i);
    }
  });

  let moves: [number, number][] = [];
  vchildren.forEach((vchild, i) => {
    const vkey = getNodeKey(vchild);
    if (typeof vkey !== "undefined") {
      const j = bKeyIndex.get(vkey);
      if (typeof j !== "undefined" && i !== j) {
        moves.push([j, i]);
      }
    }
  });

  const oldChildren = [...bchildren];
  for (const [j, i] of moves) {
    // this swap migth create "empty holes" in `bchildren` when `bchildren.length < vchildren.length`
    bchildren[i] = oldChildren[j];
  }

  return moves;
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
    if (props[k] !== oldProps[k]) {
      hnode.setAttribute(k, props[k] as any);
    }
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
          children: children.map((c) => normalizeComponentChild(c)),
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
    return {
      type: "fragment",
      key,
      children: children.map((c) => normalizeComponentChild(c)),
    };
  } else if (typeof t === "function") {
    return {
      type: "custom",
      key,
      props: {
        ...props,
        children: child,
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
