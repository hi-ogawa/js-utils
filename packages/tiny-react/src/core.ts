import { tinyassert } from "@hiogawa/utils";

// for starter
// - just insert without diff

export function render(vnode: VirtualNode, parentDom: HostNode) {
  diff(
    parentDom,
    // preact wraps root vnode with Fragment https://github.com/preactjs/preact/blob/aed9150999e9960f0b3c7e62d4c18fc09faa03de/src/render.js#L32-L33
    vnode,
    EMPTY_VNODE
  );
}

export function h(type: ComponentType, props: BaseProps): VirtualNode {
  return {
    type,
    props,
  };
}

// diff virtual nodes
function diff(
  parentDom: HostNode,
  newVnode: VirtualNode,
  oldVnode: VirtualNode
) {
  if (typeof newVnode.type === "function") {
    newVnode.type satisfies UserComponentType;
    const innerVnode = newVnode.type(newVnode.props);
    diffChildren(parentDom, [innerVnode], newVnode, oldVnode);
  } else if (newVnode.type === Fragment) {
    if (newVnode.props.children) {
      diffChildren(parentDom, newVnode.props.children, newVnode, oldVnode);
    }
  } else {
    newVnode.type satisfies HostComponentType;
    const dom = diffElementNodes(undefined, newVnode, oldVnode);
    parentDom.appendChild(dom);
  }
}

// diff for
// - `UserComponent` render result (called by `diff`)
// - `Fragment` children (called by `diff`)
// - `props.children` of `HostComponent` vnode (called by `diffElementNodes`)
function diffChildren(
  parentDom: HostNode,
  children: VirtualChildren,
  _newParentVnode: VirtualNode,
  _oldParentVnode: VirtualNode
) {
  for (const child of children) {
    if (
      child === null ||
      typeof child === "boolean" ||
      typeof child === "undefined"
    ) {
      continue;
    }
    if (typeof child === "string" || typeof child === "number") {
      // preact uses vnode with `props = null` for text node
      const textNode = document.createTextNode(String(child));
      parentDom.appendChild(textNode);
      continue;
    }
    const newVnode = child;
    const oldVnode = EMPTY_VNODE;
    diff(parentDom, newVnode, oldVnode);
  }
}

// diff host nodes
function diffElementNodes(
  _dom: HostNode | undefined,
  newVnode: VirtualNode,
  oldVnode: VirtualNode
): HostNode {
  tinyassert(typeof newVnode.type === "string");

  const dom = document.createElement(newVnode.type);
  diffProps(dom, newVnode.props, oldVnode.props);
  if (newVnode.props.children) {
    diffChildren(dom, newVnode.props.children, newVnode, oldVnode);
  }
  return dom;
}

// diff host node props except `props.children`
function diffProps(dom: HostNode, newProps: any, _oldProps: any) {
  for (const k in newProps) {
    if (k === "children") continue;
    if (dom instanceof Element) {
      dom.setAttribute(k, newProps[k]);
    }
  }
}

//
// types
//

const EMPTY_VNODE = {} as VirtualNode;

type VirtualNode = {
  type: ComponentType;
  props: BaseProps;
};

type BaseProps = {
  // TODO: key, ref?
  children?: VirtualChildren | undefined;
  [k: string]: unknown;
};

type VirtualChild = VirtualNode | string | number | boolean | null | undefined;
type VirtualChildren = VirtualChild[];

type HostNode = Node;

type ComponentType = HostComponentType | UserComponentType | typeof Fragment;
type HostComponentType = string;
type UserComponentType = (props: unknown) => VirtualChild;

export const Fragment = Symbol.for("tiny-react.fragment");
