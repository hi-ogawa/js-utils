import { tinyassert } from "@hiogawa/utils";

// for starter
// - imitate function/variable names from preact
// - try to be abstract/descriptive via type annotation
// - just insert/overwrite without diff

export function render(vnode: VirtualNode, parentDom: HostNode) {
  diff(parentDom, vnode, EMPTY_VNODE);
}

// diff virtual nodes
function diff(parentDom: HostNode, vnode: VirtualNode, oldVnode: VirtualNode) {
  vnode._parentDom = parentDom;

  if (typeof vnode.type === "function") {
    vnode.type satisfies UserComponentType;

    const innerVnode = vnode.type(vnode.props);
    diffChildren(parentDom, innerVnode, vnode, oldVnode);
  } else {
    vnode.type satisfies HostComponentType;

    vnode._dom = diffElementNodes(oldVnode._dom, vnode, oldVnode);
  }
}

// diff for
// - render result of `UserComponent` vnode (called by `diff`) or
// - `props.children` of `HostComponent` vnode (called by `diffElementNodes`)
function diffChildren(
  parentDom: HostNode,
  vnode: VirtualNode,
  parentVnode: VirtualNode,
  _oldParentVnode: VirtualNode
) {
  parentDom;
  vnode;
  parentVnode;
}

// diff host nodes
function diffElementNodes(
  dom: HostNode | undefined,
  vnode: VirtualNode,
  _oldVnode: VirtualNode
): HostNode {
  tinyassert(typeof vnode.type === "string");
  tinyassert(vnode._parentDom);

  dom ??= document.createElement(vnode.type);

  // diffChildren(dom, vnode, )

  diffProps;
  vnode.props.children;
  return dom;
}

// diff host node props except `props.children`
function diffProps() {}

//
// types
//

const EMPTY_VNODE = {} as VirtualNode;

type VirtualNode = {
  type: ComponentType;
  props: any; // TODO: key, ref?

  // component?: any; // instance of "type"?

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
