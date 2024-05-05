import { expect, test } from "vitest";
import { createRoot } from "./compat";

test("repro", () => {
  const el = document.createElement("main");
  const root = createRoot(el);
  root.render(
    <div>
      <div>1</div>
      <div>2</div>
      <div>3</div>
    </div>
  );
  expect(el).toMatchInlineSnapshot(`
    <main>
      <div>
        <div>
          1
        </div>
        <div>
          2
        </div>
        <div>
          3
        </div>
      </div>
    </main>
  `);

  root.render(
    <div>
      <div>Test</div>
      <div>hey</div>
    </div>
  );
  expect(el).toMatchInlineSnapshot(`
    <main>
      <div>
        <div>
          Test
        </div>
        <div>
          hey
        </div>
      </div>
    </main>
  `);

  // TODO: where is "<div>3</div>" ???
  root.render(
    <div>
      <div>1</div>
      <div>2</div>
      <div>3</div>
    </div>
  );
  expect(el).toMatchInlineSnapshot(`
    <main>
      <div>
        <div>
          1
        </div>
        <div>
          2
        </div>
      </div>
    </main>
  `);
});
