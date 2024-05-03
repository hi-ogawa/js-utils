import {
  type ComponentChildren,
  NODE_TYPE_CUSTOM,
  NODE_TYPE_EMPTY,
  NODE_TYPE_FRAGMENT,
  NODE_TYPE_TAG,
  NODE_TYPE_TEXT,
  type VNode,
  normalizeComponentChildren,
} from "../virtual-dom";
import {
  NODE_TYPE_REFERENCE,
  type RNode,
  type SFragment,
  type SNode,
  type STag,
} from "./types";

//
// serialize
//

export async function serializeNode(rnode: RNode): Promise<SNode> {
  return new SNodeManager().serialize(rnode);
}

class SNodeManager {
  async serialize(node: RNode): Promise<SNode> {
    if (node.type === NODE_TYPE_EMPTY || node.type === NODE_TYPE_TEXT) {
      return node;
    } else if (node.type === NODE_TYPE_REFERENCE) {
      // TODO: serialize/validate props
      node.props;
      return node;
    } else if (node.type === NODE_TYPE_TAG) {
      // TODO: validate props
      const snode: STag = {
        ...node,
        props: { ...node.props, children: undefined },
      };
      snode.props.children = await this.serialize(
        normalizeComponentChildren(
          node.props.children as ComponentChildren
        ) as RNode
      );
      return snode;
    } else if (node.type === NODE_TYPE_CUSTOM) {
      const { render, props } = node;
      const child = await render(props);
      return this.serialize(child);
    } else if (node.type === NODE_TYPE_FRAGMENT) {
      const snode: SFragment = { ...node, children: [] };
      for (const child of node.children) {
        snode.children.push(await this.serialize(child));
      }
      return snode;
    }
    return node satisfies never;
  }
}

//
// TODO: deserialize
//

export type ReferenceMap = Record<string, VNode>;

export function deserializeNode(
  snode: SNode,
  referenceMap: ReferenceMap
): VNode {
  snode;
  referenceMap;
  throw "todo";
}
