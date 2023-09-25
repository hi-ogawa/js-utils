import { tinyassert } from "@hiogawa/utils";

// for starter
// - imitate function/variable names from preact
// - try to be abstract/descriptive via type annotation
// - just insert/overwrite without diff

export function render(vnode: VirtualNode, parentDom: HostNode) {
  diff(parentDom, vnode, EMPTY_VNODE);
}

export function h(type: ComponentType, props: unknown): VirtualNode {
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
    diffChildren(parentDom, innerVnode, newVnode, oldVnode);
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
  newParentVnode: VirtualNode,
  oldParentVnode: VirtualNode
) {
  parentDom;
  children;
  newParentVnode;
  oldParentVnode;
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
  diffChildren(dom, newVnode.props.children, newVnode, oldVnode);
  return dom;
}

// diff host node props except `props.children`
function diffProps(dom: HostNode, newProps: any, oldProps: any) {
  dom;
  newProps;
  oldProps;
  for (const k in newProps) {
    dom.setAttribute(k, newProps[k]);
  }
}

//
// types
//

const EMPTY_VNODE = {} as VirtualNode;

type VirtualNode = {
  type: ComponentType;
  props: any; // TODO: key, ref, children?

  // component?: any; // instance of "type"? don't need if functional component?

  _dom?: HostNode;
  _parentDom?: HostNode;
};

type VirtualChildren = any;

type HostNode = HTMLElement;

type ComponentType = HostComponentType | UserComponentType;
type HostComponentType = string;
type UserComponentType = (props: unknown) => VirtualNode;

// hook state?
// update queue?
// type RenderContext = {}
