import { sleep } from "@hiogawa/utils";
import { describe, expect, it } from "vitest";
import { h } from "../helper/hyperscript";
import type { VNode } from "../virtual-dom";
import { serializeNode } from "./serialize";
import type { RNode } from "./types";

describe(serializeNode, () => {
  it("basic", async () => {
    const vnode = h.div(
      { className: "flex", ariaCurrent: "" },
      "hello",
      h.span(
        {
          title: "foo",
        },
        "world"
      )
    );
    expect(await serializeNode(vnode as RNode)).toMatchInlineSnapshot(`
      {
        "key": undefined,
        "name": "div",
        "props": {
          "ariaCurrent": "",
          "children": {
            "children": [
              {
                "data": "hello",
                "type": "text",
              },
              {
                "key": undefined,
                "name": "span",
                "props": {
                  "children": {
                    "data": "world",
                    "type": "text",
                  },
                  "title": "foo",
                },
                "type": "tag",
              },
            ],
            "type": "fragment",
          },
          "className": "flex",
        },
        "type": "tag",
      }
    `);
  });

  it("async", async () => {
    async function Custom(props: { value: number }) {
      await sleep(50);
      return h.span({}, JSON.stringify({ prop: props.value }));
    }
    const vnode = h.div({}, h(Custom as any, { value: 123 }));
    expect(await serializeNode(vnode as RNode)).toMatchInlineSnapshot(`
      {
        "key": undefined,
        "name": "div",
        "props": {
          "children": {
            "key": undefined,
            "name": "span",
            "props": {
              "children": {
                "data": "{"prop":123}",
                "type": "text",
              },
            },
            "type": "tag",
          },
        },
        "type": "tag",
      }
    `);
  });

  it("island", async () => {
    async function Server(props: { clientInner: VNode }) {
      return h.div({ id: "server" }, props.clientInner);
    }

    function ClientInner(props: { inner: VNode }) {
      return h.div({ id: "client-inner" }, props.inner);
    }

    Object.assign(ClientInner, { $$id: "#ClientInner" });

    const vnode = h(Server as any, {
      clientInner: h(ClientInner, { inner: h.span({}) }),
    });
    expect(await serializeNode(vnode as RNode)).toMatchInlineSnapshot(`
      {
        "key": undefined,
        "name": "div",
        "props": {
          "children": {
            "id": "#ClientInner",
            "key": undefined,
            "props": {
              "inner": {
                "key": undefined,
                "name": "span",
                "props": {},
                "type": "tag",
              },
            },
            "type": "reference",
          },
          "id": "server",
        },
        "type": "tag",
      }
    `);
  });

  it("interleave", async () => {
    // TODO: reference props needs to be serialized to support interleave

    async function Server(props: { clientInner: VNode }) {
      return h.div({ id: "server" }, props.clientInner);
    }

    function ClientOuter(props: { server: VNode }) {
      return h.div({ id: "client-outer" }, props.server);
    }

    function ClientInner(props: { inner: VNode }) {
      return h.div({ id: "client-inner" }, props.inner);
    }

    Object.assign(ClientOuter, { $$id: "#ClientOuter" });
    Object.assign(ClientInner, { $$id: "#ClientInner" });

    const vnode = h(ClientOuter, {
      server: h(Server as any, {
        clientInner: h(ClientInner, { inner: h.span({}) }),
      }),
    });
    expect(await serializeNode(vnode as RNode)).toMatchInlineSnapshot(`
      {
        "id": "#ClientOuter",
        "key": undefined,
        "props": {
          "server": {
            "key": undefined,
            "props": {
              "clientInner": {
                "id": "#ClientInner",
                "key": undefined,
                "props": {
                  "inner": {
                    "key": undefined,
                    "name": "span",
                    "props": {},
                    "type": "tag",
                  },
                },
                "type": "reference",
              },
            },
            "render": [Function],
            "type": "custom",
          },
        },
        "type": "reference",
      }
    `);
  });
});
