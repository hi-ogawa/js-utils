import { sleep } from "@hiogawa/utils";
import { describe, expect, it } from "vitest";
import { h } from "../helper/hyperscript";
import { render } from "../reconciler";
import type { VNode } from "../virtual-dom";
import { deserializeNode, serializeNode } from "./serialize";
import type { RNode } from "./types";

describe(serializeNode, () => {
  it("basic", async () => {
    const rnode = h.div(
      { className: "flex", ariaCurrent: "" },
      "hello",
      h.span(
        {
          title: "foo",
        },
        "world"
      )
    );
    const snode = await serializeNode(rnode as RNode);
    expect(snode).toMatchInlineSnapshot(`
      {
        "key": undefined,
        "name": "div",
        "props": {
          "ariaCurrent": "",
          "children": [
            "hello",
            {
              "key": undefined,
              "name": "span",
              "props": {
                "children": "world",
                "title": "foo",
              },
              "type": "tag",
            },
          ],
          "className": "flex",
        },
        "type": "tag",
      }
    `);

    const vnode = deserializeNode(snode, {});
    expect(vnode).toMatchInlineSnapshot(`
      {
        "key": undefined,
        "name": "div",
        "props": {
          "ariaCurrent": "",
          "children": [
            "hello",
            {
              "key": undefined,
              "name": "span",
              "props": {
                "children": "world",
                "title": "foo",
              },
              "type": "tag",
            },
          ],
          "className": "flex",
        },
        "type": "tag",
      }
    `);

    const node = document.createElement("main");
    render(vnode, node);
    expect(node).toMatchInlineSnapshot(`
      <main>
        <div
          ariacurrent=""
          class="flex"
        >
          hello
          <span
            title="foo"
          >
            world
          </span>
        </div>
      </main>
    `);
  });

  it("async", async () => {
    async function Custom(props: { value: number }) {
      await sleep(50);
      return h.span({}, JSON.stringify({ prop: props.value }));
    }
    const rnode = h.div({}, h(Custom as any, { value: 123 }));

    const snode = await serializeNode(rnode as RNode);
    expect(snode).toMatchInlineSnapshot(`
      {
        "key": undefined,
        "name": "div",
        "props": {
          "children": {
            "key": undefined,
            "name": "span",
            "props": {
              "children": "{"prop":123}",
            },
            "type": "tag",
          },
        },
        "type": "tag",
      }
    `);

    const vnode = deserializeNode(snode, {});
    expect(vnode).toMatchInlineSnapshot(`
      {
        "key": undefined,
        "name": "div",
        "props": {
          "children": {
            "key": undefined,
            "name": "span",
            "props": {
              "children": "{"prop":123}",
            },
            "type": "tag",
          },
        },
        "type": "tag",
      }
    `);

    const node = document.createElement("main");
    render(vnode, node);
    expect(node).toMatchInlineSnapshot(`
      <main>
        <div>
          <span>
            {"prop":123}
          </span>
        </div>
      </main>
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

    const rnode = h(Server as any, {
      clientInner: h(ClientInner, { inner: h.span({}) }),
    });
    const snode = await serializeNode(rnode as RNode);
    expect(snode).toMatchInlineSnapshot(`
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
            "type": "custom",
          },
          "id": "server",
        },
        "type": "tag",
      }
    `);

    const vnode = deserializeNode(snode, { "#ClientInner": ClientInner });
    expect(vnode).toMatchInlineSnapshot(`
      {
        "key": undefined,
        "name": "div",
        "props": {
          "children": {
            "key": undefined,
            "props": {
              "inner": {
                "key": undefined,
                "name": "span",
                "props": {},
                "type": "tag",
              },
            },
            "render": [Function],
            "type": "custom",
          },
          "id": "server",
        },
        "type": "tag",
      }
    `);

    const node = document.createElement("main");
    render(vnode, node);
    expect(node).toMatchInlineSnapshot(`
      <main>
        <div
          id="server"
        >
          <div
            id="client-inner"
          >
            <span />
          </div>
        </div>
      </main>
    `);
  });

  it("interleave", async () => {
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

    const rnode = h(ClientOuter, {
      server: h(Server as any, {
        clientInner: h(ClientInner, { inner: h.span({}) }),
      }),
    });
    const snode = await serializeNode(rnode as RNode);
    expect(snode).toMatchInlineSnapshot(`
      {
        "id": "#ClientOuter",
        "key": undefined,
        "props": {
          "server": {
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
                "type": "custom",
              },
              "id": "server",
            },
            "type": "tag",
          },
        },
        "type": "custom",
      }
    `);

    const vnode = deserializeNode(snode, {
      "#ClientOuter": ClientOuter,
      "#ClientInner": ClientInner,
    });
    expect(vnode).toMatchInlineSnapshot(`
      {
        "key": undefined,
        "props": {
          "server": {
            "key": undefined,
            "name": "div",
            "props": {
              "children": {
                "key": undefined,
                "props": {
                  "inner": {
                    "key": undefined,
                    "name": "span",
                    "props": {},
                    "type": "tag",
                  },
                },
                "render": [Function],
                "type": "custom",
              },
              "id": "server",
            },
            "type": "tag",
          },
        },
        "render": [Function],
        "type": "custom",
      }
    `);

    const node = document.createElement("main");
    render(vnode, node);
    expect(node).toMatchInlineSnapshot(`
      <main>
        <div
          id="client-outer"
        >
          <div
            id="server"
          >
            <div
              id="client-inner"
            >
              <span />
            </div>
          </div>
        </div>
      </main>
    `);
  });

  it("client in client", async () => {
    function ClientOuter(props: { inner: VNode }) {
      return h.div({ id: "client-outer" }, props.inner);
    }

    function ClientInner(props: { inner: VNode }) {
      return h.div({ id: "client-inner" }, props.inner);
    }

    Object.assign(ClientOuter, { $$id: "#ClientOuter" });
    Object.assign(ClientInner, { $$id: "#ClientInner" });

    const rnode = h(ClientOuter, {
      inner: h(ClientInner, { inner: h.span({}) }),
    });
    const snode = await serializeNode(rnode as RNode);
    expect(snode).toMatchInlineSnapshot(`
      {
        "id": "#ClientOuter",
        "key": undefined,
        "props": {
          "inner": {
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
            "type": "custom",
          },
        },
        "type": "custom",
      }
    `);

    const vnode = deserializeNode(snode, {
      "#ClientOuter": ClientOuter,
      "#ClientInner": ClientInner,
    });
    expect(vnode).toMatchInlineSnapshot(`
      {
        "key": undefined,
        "props": {
          "inner": {
            "key": undefined,
            "props": {
              "inner": {
                "key": undefined,
                "name": "span",
                "props": {},
                "type": "tag",
              },
            },
            "render": [Function],
            "type": "custom",
          },
        },
        "render": [Function],
        "type": "custom",
      }
    `);

    const node = document.createElement("main");
    render(vnode, node);
    expect(node).toMatchInlineSnapshot(`
      <main>
        <div
          id="client-outer"
        >
          <div
            id="client-inner"
          >
            <span />
          </div>
        </div>
      </main>
    `);
  });

});
