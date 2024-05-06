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
  type RNode,
  type SCustom,
  type SFragment,
  type SNode,
  type STag,
  isRNode,
  isSNode,
} from "./types";

//
// serialize
//

// cf. https://react.dev/reference/rsc/use-client#serializable-types

export type SerializeResult = {
  data: unknown;
  referenceIds: string[];
};

export async function serialize<T>(rdata: T): Promise<SerializeResult> {
  const manager = new SerializeManager();
  const data = await manager.serializeUnknown(rdata);
  return { data, referenceIds: [...manager.referenceIds] };
}

class SerializeManager {
  referenceIds = new Set<string>();

  async serialize(node: RNode): Promise<SNode> {
    if (node.type === NODE_TYPE_EMPTY || node.type === NODE_TYPE_TEXT) {
      return node;
    } else if (node.type === NODE_TYPE_TAG) {
      return {
        ...node,
        props: await this.serializeProps(node.props),
      } satisfies STag;
    } else if (node.type === NODE_TYPE_CUSTOM) {
      if (node.render.$$id) {
        this.referenceIds.add(node.render.$$id);
        return {
          type: node.type,
          key: node.key,
          props: await this.serializeProps(node.props),
          $$id: node.render.$$id,
        } satisfies SCustom;
      }
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
    // TODO: use "Symbol.for" as vnode type tag
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

export type ReferenceMap = Record<string, unknown>;

export function deserialize<T>(data: unknown, referenceMap: ReferenceMap): T {
  const manager = new DeserializeManager(referenceMap);
  return manager.deserializeUnknown(data) as T;
}

class DeserializeManager {
  constructor(private referenceMap: ReferenceMap) {}

  deserialize(node: SNode): VNode {
    if (node.type === NODE_TYPE_EMPTY || node.type === NODE_TYPE_TEXT) {
      return node;
    } else if (node.type === NODE_TYPE_CUSTOM) {
      const Component = this.referenceMap[node.$$id];
      if (!Component) {
        console.error(node);
        throw new Error("client reference not found");
      }
      return {
        type: node.type,
        key: node.key,
        props: this.deserializeProps(node.props),
        render: Component as any,
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
