import {
  NODE_TYPE_CUSTOM,
  NODE_TYPE_EMPTY,
  NODE_TYPE_FRAGMENT,
  NODE_TYPE_TAG,
  NODE_TYPE_TEXT,
  type VCustom,
  type VFragment,
  type VNode,
  type VTag,
} from "../virtual-dom";
import {
  NODE_TYPE_REFERENCE,
  type RNode,
  type SFragment,
  type SNode,
  type SReference,
  type STag,
  isRNode,
  isSNode,
} from "./types";

//
// serialize
//

export async function serializeNode(rnode: RNode): Promise<SNode> {
  return new SerializeManager().serialize(rnode);
}

class SerializeManager {
  async serialize(node: RNode): Promise<SNode> {
    if (node.type === NODE_TYPE_EMPTY || node.type === NODE_TYPE_TEXT) {
      return node;
    } else if (node.type === NODE_TYPE_REFERENCE) {
      return {
        ...node,
        props: await this.serializeProps(node.props),
      } satisfies SReference;
    } else if (node.type === NODE_TYPE_TAG) {
      return {
        ...node,
        props: await this.serializeProps(node.props),
      } satisfies STag;
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

  async serializeProps(props: Record<string, unknown>) {
    return Object.fromEntries(
      await Promise.all(
        Object.entries(props).map(async ([k, v]) => [
          k,
          await this.serializeUnknown(v),
        ])
      )
    );
  }

  async serializeUnknown(v: unknown): Promise<unknown> {
    if (typeof v === "function") {
      throw new Error("Cannot serialize function");
    }
    if (
      v === null ||
      typeof v === "undefined" ||
      typeof v === "string" ||
      typeof v === "boolean" ||
      typeof v === "number"
    ) {
      return v;
    }
    if (isRNode(v)) {
      return this.serialize(v);
    }
    if (Array.isArray(v)) {
      return Promise.all(v.map((v) => this.serializeUnknown(v)));
    }
    return Object.fromEntries(
      await Promise.all(
        Object.entries(v).map(async ([k, v]) => [
          k,
          await this.serializeUnknown(v),
        ])
      )
    );
  }
}

//
// deserialize
//

export type ReferenceMap = Record<string, Function>;

export function deserializeNode(
  snode: SNode,
  referenceMap: ReferenceMap
): VNode {
  return new DeserializeManager(referenceMap).deserialize(snode);
}

class DeserializeManager {
  constructor(private referenceMap: ReferenceMap) {}

  deserialize(node: SNode): VNode {
    if (node.type === NODE_TYPE_EMPTY || node.type === NODE_TYPE_TEXT) {
      return node;
    } else if (node.type === NODE_TYPE_REFERENCE) {
      return {
        type: NODE_TYPE_CUSTOM,
        key: node.key,
        props: this.deserializeProps(node.props),
        render: this.referenceMap[node.id] as any,
      } satisfies VCustom;
    } else if (node.type === NODE_TYPE_TAG) {
      return {
        ...node,
        props: this.deserializeProps(node.props),
      } satisfies VTag;
    } else if (node.type === NODE_TYPE_FRAGMENT) {
      const snode: VFragment = { ...node, children: [] };
      for (const child of node.children) {
        snode.children.push(this.deserialize(child));
      }
      return snode;
    }
    return node satisfies never;
  }

  deserializeProps(props: Record<string, unknown>) {
    return Object.fromEntries(
      Object.entries(props).map(([k, v]) => [k, this.deserializeUnknown(v)])
    );
  }

  deserializeUnknown(v: unknown): unknown {
    if (typeof v === "function") {
      throw new Error("Cannot serialize function");
    }
    if (
      v === null ||
      typeof v === "undefined" ||
      typeof v === "string" ||
      typeof v === "boolean" ||
      typeof v === "number"
    ) {
      return v;
    }
    if (isSNode(v)) {
      return this.deserialize(v);
    }
    if (Array.isArray(v)) {
      return v.map((v) => this.deserializeUnknown(v));
    }
    return Object.fromEntries(
      Object.entries(v).map(([k, v]) => [k, this.deserializeUnknown(v)])
    );
  }
}
