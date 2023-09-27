// architecture inspired by yew
// https://github.com/yewstack/yew

import { zipMax } from "@hiogawa/utils";

export function render(vnode: VNode, parent: HNode) {
  const bnode = reconcile(vnode, emptyBnode(), parent);
  return bnode;
}

export function reconcile(
  vnode: VNode,
  bnode: BNode, // mutated
  parent: HNode // TODO: + where to append
): BNode {
  switch (vnode.type) {
    case "tag": {
      if (
        bnode.type === "tag" &&
        bnode.key === vnode.key &&
        bnode.name === vnode.name
      ) {
        reconcileTagProps(bnode.hnode, vnode.props, bnode.props);
        bnode.props = vnode.props;
        bnode.child = reconcile(vnode.child, bnode, bnode.hnode);
      } else {
        unmount(bnode);
        // TODO: ref callback
        const hnode = document.createElement(vnode.name);
        const child = reconcile(vnode.child, emptyBnode(), hnode);
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
        // TODO: match bnode.children order by key
      } else {
        unmount(bnode);
        bnode = { ...vnode, children: [] } satisfies BFragment;
      }
      const newChildren: BFragment["children"] = [];
      for (const [vchild, bchild] of zipMax(vnode.children, bnode.children)) {
        if (vchild) {
          newChildren.push(reconcile(vchild, bchild ?? emptyBnode(), parent));
        } else if (bchild) {
          unmount(bchild);
        }
      }
      bnode.children = newChildren;
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
        const child = reconcile(vchild, emptyBnode(), parent);
        bnode = { ...vnode, child } satisfies BCustom;
      }
      break;
    }
  }
  return bnode;
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
  // TODO: unmount/ref callback
  switch (bnode.type) {
    case "tag": {
      unmount(bnode.child); // TODO: can skip actual remove since parent removes all anyways
      removeHnode(bnode.hnode);
      break;
    }
    case "text": {
      removeHnode(bnode.hnode);
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

function removeHnode(hnode: HNode) {
  hnode.parentNode?.removeChild(hnode);
}

//
// types
//

type NodeKey = string;
type Props = Record<string, unknown>;

// host node
type HNode = Node;

//
// virtual node
//

// TODO: optimize object shape?
export type VNode = VTag | VText | VCustom | VFragment;

// TODO: optimize empty case?
// type VEmpty = null;
// type BEmpty = null;

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

type BNode = BTag | BText | BCustom | BFragment;

type BTag = Omit<VTag, "child"> & {
  child: BNode;
  hnode: HNode;
};

type BText = VText & {
  hnode: Text; // TODO: optimize empty string
};

type BCustom = VCustom & {
  child: BNode;
};

type BFragment = Omit<VFragment, "children"> & {
  children: BNode[];
};

function emptyBnode(): BNode {
  return {
    type: "fragment",
    children: [],
  };
}
