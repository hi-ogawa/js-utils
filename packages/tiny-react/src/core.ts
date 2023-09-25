import { tinyassert } from "@hiogawa/utils";

// for starter
// - imitate function/variable names from preact
// - try to be abstract/descriptive via type annotation
// - just insert/overwrite without diff

export function render(vnode: VirtualNode, parentDom: HostNode) {
  // TODO: need to wrap vnode since `diff` doesn't insert bare `HostComponentType` at the top level.
  // cf. https://github.com/preactjs/preact/blob/aed9150999e9960f0b3c7e62d4c18fc09faa03de/src/render.js#L32-L33
  diff(parentDom, vnode, EMPTY_VNODE);
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
  newVnode._parentDom = parentDom;

  if (typeof newVnode.type === "function") {
    newVnode.type satisfies UserComponentType;
    const innerVnode = newVnode.type(newVnode.props);
    diffChildren(parentDom, [innerVnode], newVnode, oldVnode);
  } else {
    newVnode.type satisfies HostComponentType;
    newVnode._dom = diffElementNodes(oldVnode._dom, newVnode, oldVnode);
  }
}

// diff for
// - render result of `UserComponent` vnode (called by `diff`) or
// - `props.children` of `HostComponent` vnode (called by `diffElementNodes`)
function diffChildren(
  parentDom: HostNode,
  children: VirtualChildren,
  _newParentVnode: VirtualNode,
  _oldParentVnode: VirtualNode
) {
  let oldDom: HostNode | null = null;
  for (const newVnode of children) {
    const oldVnode = EMPTY_VNODE;
    diff(parentDom, newVnode, oldVnode);
    if (newVnode._dom) {
      parentDom.insertBefore(newVnode._dom, oldDom?.nextSibling ?? null);
      oldDom = newVnode._dom;
    }
  }
}

// diff host nodes
function diffElementNodes(
  dom: HostNode | undefined,
  newVnode: VirtualNode,
  oldVnode: VirtualNode
): HostNode {
  tinyassert(typeof newVnode.type === "string");
  tinyassert(newVnode._parentDom);

  dom ??= document.createElement(newVnode.type);
  diffProps(dom, newVnode.props, oldVnode.props);
  if (newVnode.props.children) {
    diffChildren(dom, newVnode.props.children, newVnode, oldVnode);
  }
  return dom;
}

// diff host node props except `props.children`
function diffProps(dom: HostNode, newProps: any, oldProps: any) {
  dom;
  newProps;
  oldProps;
  for (const k in newProps) {
    if (k === "children") continue;
    dom.setAttribute(k, newProps[k]);
  }
}

//
// types
//

const EMPTY_VNODE = {} as VirtualNode;

type VirtualNode = {
  type: ComponentType;
  props: BaseProps;

  // component?: any; // instance of "type"? don't need if functional component?

  _dom?: HostNode;
  _parentDom?: HostNode;
};

type BaseProps = {
  children?: VirtualChildren | undefined;
  [k: string]: unknown;
};

// type VirtualChild = VirtualNode | boolean | number | string | null | undefined;
type VirtualChild = VirtualNode;
type VirtualChildren = VirtualChild[];

type HostNode = HTMLElement;

type ComponentType = HostComponentType | UserComponentType;
type HostComponentType = string;
type UserComponentType = (props: unknown) => VirtualChild;

// hook state?
// update queue?
// type RenderContext = {}
