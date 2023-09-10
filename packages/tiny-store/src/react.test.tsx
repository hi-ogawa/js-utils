import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it } from "vitest";
import { createSimpleStore, storeSelect } from "./core";
import { useSimpleStore } from "./react";

// cf. https://github.com/pmndrs/jotai/blob/2526039ea4da082749adc8a449c33422c53d9819/tests/react/basic.test.tsx

describe(useSimpleStore, () => {
  it("basic", async () => {
    const store = createSimpleStore(1);
    function Demo() {
      const [state, setState] = useSimpleStore(store);
      return (
        <>
          <div data-testid="demo">{state}</div>
          <button onClick={() => setState((c) => c + 1)}>+1</button>
        </>
      );
    }
    render(
      <>
        <Demo />
      </>
    );
    expect(await getTestidText("demo")).toMatchInlineSnapshot('"1"');

    await userEvent.click(await screen.findByRole("button"));
    expect(await getTestidText("demo")).toMatchInlineSnapshot('"2"');
  });

  it(storeSelect, async () => {
    const store1 = createSimpleStore({
      name: {
        first: "Jane",
      },
      birth: {
        year: 2000,
      },
    });
    const store2 = storeSelect(store1, (v) => v.name);

    function Demo1() {
      const [state, setState] = useSimpleStore(store1);
      return (
        <>
          <div data-testid="demo1">
            commit = {useCommitCount()}, state = {JSON.stringify(state)}
          </div>
          <button
            data-testid="button-birth"
            onClick={() =>
              setState((v) => ({ ...v, birth: { year: v.birth.year + 1 } }))
            }
          >
            +1
          </button>
          <button
            data-testid="button-name"
            onClick={() => setState((v) => ({ ...v, name: { first: "John" } }))}
          >
            John
          </button>
        </>
      );
    }

    function Demo2() {
      const [state] = useSimpleStore(store2);
      return (
        <>
          <div data-testid="demo2">
            commit = {useCommitCount()}, state = {JSON.stringify(state)}
          </div>
        </>
      );
    }

    render(
      <>
        <Demo1 />
        <Demo2 />
      </>
    );
    expect([await getTestidText("demo1"), await getTestidText("demo2")])
      .toMatchInlineSnapshot(`
        [
          "commit = 1, state = {\\"name\\":{\\"first\\":\\"Jane\\"},\\"birth\\":{\\"year\\":2000}}",
          "commit = 1, state = {\\"first\\":\\"Jane\\"}",
        ]
      `);

    await userEvent.click(await screen.findByTestId("button-birth"));
    expect([await getTestidText("demo1"), await getTestidText("demo2")])
      .toMatchInlineSnapshot(`
        [
          "commit = 2, state = {\\"name\\":{\\"first\\":\\"Jane\\"},\\"birth\\":{\\"year\\":2001}}",
          "commit = 1, state = {\\"first\\":\\"Jane\\"}",
        ]
      `);

    await userEvent.click(await screen.findByTestId("button-name"));
    expect([await getTestidText("demo1"), await getTestidText("demo2")])
      .toMatchInlineSnapshot(`
          [
            "commit = 3, state = {\\"name\\":{\\"first\\":\\"John\\"},\\"birth\\":{\\"year\\":2001}}",
            "commit = 2, state = {\\"first\\":\\"John\\"}",
          ]
        `);
  });
});

//
// helpers
//

async function getTestidText(testId: string) {
  const el = await screen.findByTestId(testId);
  return el.textContent;
}

function useCommitCount() {
  const commitCountRef = React.useRef(1);
  React.useEffect(() => {
    commitCountRef.current += 1;
  });
  return commitCountRef.current;
}
