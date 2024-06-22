// @vitest-environment happy-dom

import { act, cleanup, render } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type ViteHot, setupVite } from "./runtime";

afterEach(cleanup);

describe("hmr", () => {
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
      function Child() {
        React.useEffect(() => {
          mockFn("effect-setup-1");
          return () => {
            mockFn("effect-cleanup-1");
          };
        }, []);
        return <div>1</div>;
      }

      const manager = setupVite(hot, React, false);
      ChildExport = manager.wrap("Child", Child, "useEffect");
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
      function Child() {
        return <div>2</div>;
      }
      const manager = setupVite(hot, React, false);
      manager.wrap("Child", Child, "");
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
      function Child() {
        React.useEffect(() => {
          mockFn("effect-setup-3");
          return () => {
            mockFn("effect-cleanup-3");
          };
        }, []);
        return <div>3</div>;
      }

      const manager = setupVite(hot, React, false);
      manager.wrap("Child", Child, "useEffect");
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

    //
    // 4th version (this effect doesn't run since hook key is same)
    //
    {
      function Child() {
        React.useEffect(() => {
          mockFn("effect-setup-4");
          return () => {
            mockFn("effect-cleanup-4");
          };
        }, []);
        return <div>4</div>;
      }

      const manager = setupVite(hot, React, false);
      manager.wrap("Child", Child, "useEffect");
    }

    act(() => acceptCallbacks[1]({}));
    expect(result.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div>
            4
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

    //
    // 5th version
    //
    {
      function Child() {
        return <div>5</div>;
      }

      const manager = setupVite(hot, React, false);
      manager.wrap("Child", Child, "");
    }

    act(() => acceptCallbacks[1]({}));
    expect(result.baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <div>
            5
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
        [
          "effect-cleanup-3",
        ],
      ]
    `);
  });
});
