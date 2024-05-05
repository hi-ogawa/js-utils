// @vitest-environment jsdom

import { act, cleanup, render } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  type ViteHot,
  createHmrComponent,
  createHmrRegistry,
  setupHmrVite,
} from "./runtime";

afterEach(cleanup);

describe(setupHmrVite, () => {
  it("basic 1", async () => {
    const acceptCallbacks: ((newModule?: unknown) => void)[] = [];

    const hot: ViteHot = {
      accept: (callback) => {
        acceptCallbacks.push(callback);
      },
      invalidate: () => {},
      data: {},
    };

    let ChildExport: any;

    const mockFn = vi.fn();

    //
    // 1st version
    //
    {
      const registry = createHmrRegistry(React);

      ChildExport = createHmrComponent(
        registry,
        "Child",
        function Child() {
          React.useEffect(() => {
            mockFn("effect-setup-1");
            return () => {
              mockFn("effect-cleanup-1");
            };
          }, []);
          return <div>1</div>;
        },
        { key: "useEffect" },
        hot
      );

      setupHmrVite(hot, registry);
    }

    function Parent() {
      return <ChildExport />;
    }
    let result = await act(() => render(<Parent />));
    expect(result.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div>
            1
          </div>
        </div>
      </body>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "effect-setup-1",
        ],
      ]
    `);

    //
    // 2nd version
    //
    {
      const registry = createHmrRegistry(React);

      // hot update's export doesn't affect original version of export
      createHmrComponent(
        registry,
        "Child",
        function Child() {
          return <div>2</div>;
        },
        { key: "" },
        hot
      );

      setupHmrVite(hot, registry);
    }

    // simulate last version's `hot.accept`
    act(() => acceptCallbacks[0]({}));
    expect(result.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div>
            2
          </div>
        </div>
      </body>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "effect-setup-1",
        ],
        [
          "effect-cleanup-1",
        ],
      ]
    `);

    //
    // 3rd version
    //
    {
      const registry = createHmrRegistry(React);

      createHmrComponent(
        registry,
        "Child",
        function Child() {
          React.useEffect(() => {
            mockFn("effect-setup-3");
            return () => {
              mockFn("effect-cleanup-3");
            };
          }, []);
          return <div>3</div>;
        },
        { key: "useEffect" },
        hot
      );

      setupHmrVite(hot, registry);
    }

    act(() => acceptCallbacks[1]({}));
    expect(result.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div>
            3
          </div>
        </div>
      </body>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "effect-setup-1",
        ],
        [
          "effect-cleanup-1",
        ],
        [
          "effect-setup-3",
        ],
      ]
    `);
  });

  it("basic 2", async () => {
    const acceptCallbacks: ((newModule?: unknown) => void)[] = [];

    const hot: ViteHot = {
      accept: (callback) => {
        acceptCallbacks.push(callback);
      },
      invalidate: () => {},
      data: {},
    };

    let ChildExport: any;

    function Parent() {
      return <ChildExport />;
    }

    const mockFn = vi.fn();

    //
    // 1st version
    //
    {
      const registry = createHmrRegistry(React);

      ChildExport = createHmrComponent(
        registry,
        "Child",
        function Child() {
          React.useEffect(() => {
            mockFn("effect-setup-1");
            return () => {
              mockFn("effect-cleanup-1");
            };
          }, []);
          return <div>1</div>;
        },
        { key: "useEffect" },
        hot
      );

      setupHmrVite(hot, registry);
    }

    let result = await act(() => render(<Parent />));
    expect(result.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div>
            1
          </div>
        </div>
      </body>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "effect-setup-1",
        ],
      ]
    `);

    //
    // 2nd version
    //
    {
      const registry = createHmrRegistry(React);

      // hot update's export doesn't affect original version of export
      createHmrComponent(
        registry,
        "Child",
        function Child() {
          React.useEffect(() => {
            mockFn("effect-setup-2");
            return () => {
              mockFn("effect-cleanup-2");
            };
          }, []);
          return <div>2</div>;
        },
        { key: "useEffect" },
        hot
      );

      setupHmrVite(hot, registry);
    }

    act(() => acceptCallbacks[0]({}));
    expect(result.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div>
            2
          </div>
        </div>
      </body>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "effect-setup-1",
        ],
      ]
    `);

    //
    // 3rd version
    //
    {
      const registry = createHmrRegistry(React);

      createHmrComponent(
        registry,
        "Child",
        function Child() {
          return <div>3</div>;
        },
        { key: "" },
        hot
      );

      setupHmrVite(hot, registry);
    }

    act(() => acceptCallbacks[1]({}));
    expect(result.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div>
            3
          </div>
        </div>
      </body>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "effect-setup-1",
        ],
        [
          "effect-cleanup-1",
        ],
      ]
    `);
  });
});
