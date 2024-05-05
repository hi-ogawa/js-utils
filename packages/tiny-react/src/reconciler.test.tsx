import { expect, test } from "vitest";
import { createRoot } from "./compat";

test("fragment", () => {
  const el = document.createElement("main");
  const root = createRoot(el);
  root.render(
    <div>
      <div>a1</div>
      <div>a2</div>
      <div>a3</div>
    </div>
  );
  expect(el).toMatchInlineSnapshot(`
    <main>
      <div>
        <div>
          a1
        </div>
        <div>
          a2
        </div>
        <div>
          a3
        </div>
      </div>
    </main>
  `);

  root.render(
    <div>
      <div>x1</div>
      <div>x2</div>
    </div>
  );
  expect(el).toMatchInlineSnapshot(`
    <main>
      <div>
        <div>
          x1
        </div>
        <div>
          x2
        </div>
      </div>
    </main>
  `);

  root.render(
    <div>
      <div>y1</div>
      <div>y2</div>
      <div>y3</div>
    </div>
  );
  expect(el).toMatchInlineSnapshot(`
    <main>
      <div>
        <div>
          y1
        </div>
        <div>
          y2
        </div>
        <div>
          y3
        </div>
      </div>
    </main>
  `);
});
