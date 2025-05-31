import { sleep } from "@hiogawa/utils";
import { describe, expect, it } from "vitest";
import { deserialize, serialize } from ".";
import type { JSX } from "../helper/jsx-runtime";
import { render } from "../reconciler";
import type { VNode } from "../virtual-dom";
import { type RNode, registerClientReference } from "./types";

describe(serialize, () => {
  it("basic", async () => {
    const rnode = (
      <div className="flex" ariaCurrent="page">
        hello
        <span title="foo">world</span>
      </div>
    );
    const { data: snode, referenceIds } = await serialize<RNode>(rnode);
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
              "type": Symbol(tiny-react.tag),
            },
          ],
          "className": "flex",
        },
        "type": Symbol(tiny-react.tag),
      }
    `);

    const vnode = deserialize<VNode>(snode, {});
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
              "type": Symbol(tiny-react.tag),
            },
          ],
          "className": "flex",
        },
        "type": Symbol(tiny-react.tag),
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
    const { data: snode, referenceIds } = await serialize(rnode);
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
            "type": Symbol(tiny-react.tag),
          },
        },
        "type": Symbol(tiny-react.tag),
      }
    `);

    const vnode = deserialize<VNode>(snode, {});
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
            "type": Symbol(tiny-react.tag),
          },
        },
        "type": Symbol(tiny-react.tag),
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
    const { data: snode, referenceIds } = await serialize(rnode);
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
                "type": Symbol(tiny-react.tag),
              },
            },
            "type": Symbol(tiny-react.custom),
          },
          "id": "server",
        },
        "type": Symbol(tiny-react.tag),
      }
    `);

    const vnode = deserialize<VNode>(snode, { "#ClientInner": ClientInner });
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
                "type": Symbol(tiny-react.tag),
              },
            },
            "render": [Function],
            "type": Symbol(tiny-react.custom),
          },
          "id": "server",
        },
        "type": Symbol(tiny-react.tag),
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
    const { data: snode, referenceIds } = await serialize(rnode);
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
                    "type": Symbol(tiny-react.tag),
                  },
                },
                "type": Symbol(tiny-react.custom),
              },
              "id": "server",
            },
            "type": Symbol(tiny-react.tag),
          },
        },
        "type": Symbol(tiny-react.custom),
      }
    `);

    const vnode = deserialize<VNode>(snode, {
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
                    "type": Symbol(tiny-react.tag),
                  },
                },
                "render": [Function],
                "type": Symbol(tiny-react.custom),
              },
              "id": "server",
            },
            "type": Symbol(tiny-react.tag),
          },
        },
        "render": [Function],
        "type": Symbol(tiny-react.custom),
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
    const { data: snode, referenceIds } = await serialize(rnode);
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
                "type": Symbol(tiny-react.tag),
              },
            },
            "type": Symbol(tiny-react.custom),
          },
        },
        "type": Symbol(tiny-react.custom),
      }
    `);

    const vnode = deserialize<VNode>(snode, {
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
                "type": Symbol(tiny-react.tag),
              },
            },
            "render": [Function],
            "type": Symbol(tiny-react.custom),
          },
        },
        "render": [Function],
        "type": Symbol(tiny-react.custom),
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
      serialize(<div onclick={() => {}} />)
    ).rejects.toMatchInlineSnapshot(`[Error: Cannot serialize function]`);
  });

  it("no 'type' collision", async () => {
    function Custom(_props: { x: { type: "tag" } }) {
      return <></>;
    }
    registerClientReference(Custom, "#Custom");

    const result = await serialize(
      <Custom
        x={{
          type: "tag",
        }}
      />
    );
    expect(result).toMatchInlineSnapshot(`
      {
        "data": {
          "$$id": "#Custom",
          "key": undefined,
          "props": {
            "x": {
              "type": "tag",
            },
          },
          "type": Symbol(tiny-react.custom),
        },
        "referenceIds": [
          "#Custom",
        ],
      }
    `);
  });

  it("multiple nodes", async () => {
    async function Server(props: JSX.ElementChildrenAttribute) {
      return <div id="server">{props.children}</div>;
    }
    function Client1(props: JSX.ElementChildrenAttribute) {
      return <div id="client1">{props.children}</div>;
    }
    function Client2(props: JSX.ElementChildrenAttribute) {
      return <div id="client2">{props.children}</div>;
    }
    registerClientReference(Client1, "#Client1");
    registerClientReference(Client2, "#Client2");

    const rdata = {
      k1: (
        <Server>
          <span>
            <Client1>hey</Client1>
          </span>
        </Server>
      ),
      k2: [
        <Server>
          <pre>
            <Client2>yo</Client2>
          </pre>
        </Server>,
      ],
    };
    const result = await serialize(rdata);
    expect(result.referenceIds).toMatchInlineSnapshot(`
      [
        "#Client1",
        "#Client2",
      ]
    `);
    expect(result.data).toMatchInlineSnapshot(`
      {
        "k1": {
          "key": undefined,
          "name": "div",
          "props": {
            "children": {
              "key": undefined,
              "name": "span",
              "props": {
                "children": {
                  "$$id": "#Client1",
                  "key": undefined,
                  "props": {
                    "children": "hey",
                  },
                  "type": Symbol(tiny-react.custom),
                },
              },
              "type": Symbol(tiny-react.tag),
            },
            "id": "server",
          },
          "type": Symbol(tiny-react.tag),
        },
        "k2": [
          {
            "key": undefined,
            "name": "div",
            "props": {
              "children": {
                "key": undefined,
                "name": "pre",
                "props": {
                  "children": {
                    "$$id": "#Client2",
                    "key": undefined,
                    "props": {
                      "children": "yo",
                    },
                    "type": Symbol(tiny-react.custom),
                  },
                },
                "type": Symbol(tiny-react.tag),
              },
              "id": "server",
            },
            "type": Symbol(tiny-react.tag),
          },
        ],
      }
    `);

    const vnode = deserialize<typeof rdata>(result.data, {
      "#Client1": Client1,
      "#Client2": Client2,
    });
    expect(vnode).toMatchInlineSnapshot(`
      {
        "k1": {
          "key": undefined,
          "name": "div",
          "props": {
            "children": {
              "key": undefined,
              "name": "span",
              "props": {
                "children": {
                  "key": undefined,
                  "props": {
                    "children": "hey",
                  },
                  "render": [Function],
                  "type": Symbol(tiny-react.custom),
                },
              },
              "type": Symbol(tiny-react.tag),
            },
            "id": "server",
          },
          "type": Symbol(tiny-react.tag),
        },
        "k2": [
          {
            "key": undefined,
            "name": "div",
            "props": {
              "children": {
                "key": undefined,
                "name": "pre",
                "props": {
                  "children": {
                    "key": undefined,
                    "props": {
                      "children": "yo",
                    },
                    "render": [Function],
                    "type": Symbol(tiny-react.custom),
                  },
                },
                "type": Symbol(tiny-react.tag),
              },
              "id": "server",
            },
            "type": Symbol(tiny-react.tag),
          },
        ],
      }
    `);

    {
      const node = document.createElement("main");
      render(vnode.k1, node);
      expect(node).toMatchInlineSnapshot(`
        <main>
          <div
            id="server"
          >
            <span>
              <div
                id="client1"
              >
                hey
              </div>
            </span>
          </div>
        </main>
      `);
    }
    {
      const node = document.createElement("main");
      render(vnode.k2[0], node);
      expect(node).toMatchInlineSnapshot(`
        <main>
          <div
            id="server"
          >
            <pre>
              <div
                id="client2"
              >
                yo
              </div>
            </pre>
          </div>
        </main>
      `);
    }
  });
});
