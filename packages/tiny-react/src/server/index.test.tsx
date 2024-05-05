import { sleep } from "@hiogawa/utils";
import { describe, expect, it } from "vitest";
import { deserializeNode, serializeNode } from ".";
import { render } from "../reconciler";
import type { VNode } from "../virtual-dom";
import { registerClientReference } from "./types";

describe(serializeNode, () => {
  it("basic", async () => {
    const rnode = (
      <div className="flex" ariaCurrent="page">
        hello
        <span title="foo">world</span>
      </div>
    );
    const { snode, referenceIds } = await serializeNode(rnode);
    expect(referenceIds).toMatchInlineSnapshot(`[]`);
    expect(snode).toMatchInlineSnapshot(`
      {
        "key": undefined,
        "name": "div",
        "props": {
          "ariaCurrent": "page",
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
          "ariaCurrent": "page",
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
          ariacurrent="page"
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
      return <span>{JSON.stringify({ prop: props.value })}</span>;
    }
    const rnode = (
      <div>
        <Custom value={123} />
      </div>
    );
    const { snode, referenceIds } = await serializeNode(rnode);
    expect(referenceIds).toMatchInlineSnapshot(`[]`);
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
      return <div id="server">{props.clientInner}</div>;
    }

    function ClientInner(props: { inner: VNode }) {
      return <div id="client-inner">{props.inner}</div>;
    }
    registerClientReference(ClientInner, "#ClientInner");

    const rnode = <Server clientInner={<ClientInner inner={<span />} />} />;
    const { snode, referenceIds } = await serializeNode(rnode);
    expect(referenceIds).toMatchInlineSnapshot(`
      [
        "#ClientInner",
      ]
    `);
    expect(snode).toMatchInlineSnapshot(`
      {
        "key": undefined,
        "name": "div",
        "props": {
          "children": {
            "$$id": "#ClientInner",
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
      return <div id="server">{props.clientInner}</div>;
    }

    function ClientOuter(props: { server: VNode }) {
      return <div id="client-outer">{props.server}</div>;
    }

    function ClientInner(props: { inner: VNode }) {
      return <div id="client-inner">{props.inner}</div>;
    }
    registerClientReference(ClientOuter, "#ClientOuter");
    registerClientReference(ClientInner, "#ClientInner");

    const rnode = (
      <ClientOuter
        server={<Server clientInner={<ClientInner inner={<span />} />} />}
      />
    );
    const { snode, referenceIds } = await serializeNode(rnode);
    expect(referenceIds).toMatchInlineSnapshot(`
      [
        "#ClientOuter",
        "#ClientInner",
      ]
    `);
    expect(snode).toMatchInlineSnapshot(`
      {
        "$$id": "#ClientOuter",
        "key": undefined,
        "props": {
          "server": {
            "key": undefined,
            "name": "div",
            "props": {
              "children": {
                "$$id": "#ClientInner",
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
      return <div id="client-outer">{props.inner}</div>;
    }

    function ClientInner(props: { inner: VNode }) {
      return <div id="client-inner">{props.inner}</div>;
    }

    registerClientReference(ClientOuter, "#ClientOuter");
    registerClientReference(ClientInner, "#ClientInner");

    const rnode = <ClientOuter inner={<ClientInner inner={<span />} />} />;
    const { snode, referenceIds } = await serializeNode(rnode);
    expect(referenceIds).toMatchInlineSnapshot(`
      [
        "#ClientOuter",
        "#ClientInner",
      ]
    `);
    expect(snode).toMatchInlineSnapshot(`
      {
        "$$id": "#ClientOuter",
        "key": undefined,
        "props": {
          "inner": {
            "$$id": "#ClientInner",
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

  it("function client prop error", async () => {
    await expect(() =>
      serializeNode(<div onclick={() => {}} />)
    ).rejects.toMatchInlineSnapshot(`[Error: Cannot serialize function]`);
  });
});
