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
  it("basic", async () => {
    let firstOnNewModule!: (newModule: {} | undefined) => void;

    const hot: ViteHot = {
      accept: (onNewModule) => {
        firstOnNewModule ??= onNewModule;
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

      const Child = createHmrComponent(
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
        { remount: true }
      );
      ChildExport = Child;

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
    // 2nd version (remount mode allows modifying hooks)
    //
    {
      const registry = createHmrRegistry(React);

      const Child = createHmrComponent(
        registry,
        "Child",
        function Child() {
          return <div>2</div>;
        },
        { remount: true }
      );
      // this export itself doesn't affect original version of export
      Child;

      setupHmrVite(hot, registry);
    }

    // simulate 1st version's hot.accept
    act(() => firstOnNewModule({}));
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

      const Child = createHmrComponent(
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
        { remount: true }
      );
      Child;

      setupHmrVite(hot, registry);
    }

    act(() => firstOnNewModule({}));
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
});
