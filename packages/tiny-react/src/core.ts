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
    // TODO: init hook state for render call
    const innerVnode = newVnode.type(newVnode.props);
    diffChildren(parentDom, [innerVnode], newVnode, oldVnode);
  } else if (newVnode.type === FragmentType) {
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
  let oldDom: Node | null = null;
  for (const child of children) {
    if (typeof child === "string" || typeof child === "number") {
      // TODO: preact uses vnode with `props = null` for text node
      const textNode = document.createTextNode(String(child));
      parentDom.insertBefore(textNode, oldDom?.nextSibling ?? null);
      oldDom = textNode;
      continue;
    }
    if (typeof child === "boolean" || !child) {
      continue;
    }
    const newVnode = child;
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
  // TODO: key, ref?
  children?: VirtualChildren | undefined;
  [k: string]: unknown;
};

type VirtualChild = VirtualNode | string | number | boolean | null | undefined;
type VirtualChildren = VirtualChild[];

type HostNode = HTMLElement;

type ComponentType = HostComponentType | UserComponentType | typeof FragmentType;
type HostComponentType = string;
type UserComponentType = (props: unknown) => VirtualChild;

const FragmentType = Symbol.for('react.fragment');

// hook state?
// update queue?
// type RenderContext = {}
