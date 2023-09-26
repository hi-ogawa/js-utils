import { tinyassert } from "@hiogawa/utils";

// for starter
// - imitate function/variable names from preact
// - try to be abstract/descriptive via type annotation
// - just insert/overwrite without diff

export function render(vnode: VirtualNode, parentDom: HostNode) {
  // TODO wrap by fragment?
  // vnode = h(Fragment, { children: [vnode] });

  diff(
    parentDom,
    // need to wrap vnode since `diff` doesn't insert bare `HostComponentType` at the top level.
    // cf. https://github.com/preactjs/preact/blob/aed9150999e9960f0b3c7e62d4c18fc09faa03de/src/render.js#L32-L33
    h(() => vnode, {}),
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
// returns (last) inserted `HostNode` for `newVnode`
function diff(
  parentDom: HostNode,
  newVnode: VirtualNode,
  oldVnode: VirtualNode
): HostNode | undefined {
  // newVnode._parentDom = parentDom;

  if (typeof newVnode.type === "function") {
    newVnode.type satisfies UserComponentType;
    // TODO: init hook state for render call
    const innerVnode = newVnode.type(newVnode.props);
    return diffChildren(parentDom, [innerVnode], newVnode, oldVnode);
  } else if (newVnode.type === Fragment) {
    return diffChildren(
      parentDom,
      newVnode.props.children ?? [],
      newVnode,
      oldVnode
    );
  } else {
    newVnode.type satisfies HostComponentType;
    // newVnode._dom = diffElementNodes(oldVnode._dom, newVnode, oldVnode);
    const dom = diffElementNodes(undefined, newVnode, oldVnode);
    return dom;
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
): HostNode | undefined {
  let lastDom: HostNode | undefined;
  for (const child of children) {
    // console.log(_newParentVnode, lastDom?.textContent);
    if (
      child === null ||
      typeof child === "boolean" ||
      typeof child === "undefined"
    ) {
      continue;
    }
    if (typeof child === "string" || typeof child === "number") {
      // TODO: preact uses vnode with `props = null` for text node
      const textNode = document.createTextNode(String(child));
      console.log("== text", {
        parentDom: parentDom.textContent,
        textNode: textNode?.textContent,
        lastDom: lastDom?.textContent,
        lastDomNextSibling: lastDom?.nextSibling?.textContent,
      });
      parentDom.insertBefore(textNode, lastDom?.nextSibling ?? null);
      lastDom = textNode;
      continue;
    }
    const newVnode = child;
    const oldVnode = EMPTY_VNODE;
    const newDom = diff(parentDom, newVnode, oldVnode);
    console.log("== node", {
      parentDom: parentDom.textContent,
      newVnode,
      newDom: newDom?.textContent,
      lastDom: lastDom?.textContent,
      lastDomNextSibling: lastDom?.nextSibling?.textContent,
    });
    // isHostComponentType(newVnode.type)
    if (isHostComponentType(newVnode.type)) {
      tinyassert(newDom);
      parentDom.insertBefore(newDom, lastDom?.nextSibling ?? null);
    }
    if (newDom) {
      lastDom = newDom;
    }
  }
  // console.log(_newParentVnode, lastDom?.textContent);
  return lastDom;
}

// diff host nodes
function diffElementNodes(
  _dom: HostNode | undefined,
  newVnode: VirtualNode,
  oldVnode: VirtualNode
): HostNode {
  tinyassert(typeof newVnode.type === "string");
  // tinyassert(newVnode._parentDom);

  console.log("=+", newVnode.type);
  const dom = document.createElement(newVnode.type);
  diffProps(dom, newVnode.props, oldVnode.props);
  if (newVnode.props.children) {
    diffChildren(dom, newVnode.props.children, newVnode, oldVnode);
  }
  console.log("=-", newVnode.type);
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

  // component?: any; // instance of "type"? don't need if functional component?

  // _dom?: HostNode;
  // _parentDom?: HostNode;
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

function isHostComponentType(t: ComponentType): t is HostComponentType {
  return typeof t === "string";
}

export const Fragment = Symbol.for("tiny-react.fragment");

// hook state?
// update queue?
// type RenderContext = {}
