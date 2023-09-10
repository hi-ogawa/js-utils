import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { createSimpleStore } from "./core";
import { useSimpleStore } from "./react";

// cf. https://github.com/pmndrs/jotai/blob/2526039ea4da082749adc8a449c33422c53d9819/tests/react/basic.test.tsx

describe(useSimpleStore, () => {
  it("basic", async () => {
    const store = createSimpleStore(0);

    function Demo() {
      const [state, setState] = useSimpleStore(store);
      return (
        <>
          <main>{state}</main>
          <button onClick={() => setState((c) => c + 1)}>increment</button>
        </>
      );
    }
    render(<Demo />);
    expect(await screen.findByRole("main")).toMatchInlineSnapshot(`
      <main>
        0
      </main>
    `);
    await userEvent.click(await screen.findByRole("button"));
    expect(await screen.findByRole("main")).toMatchInlineSnapshot(`
      <main>
        1
      </main>
    `);
  });
});
