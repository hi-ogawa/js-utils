import { expect, test } from "vitest";
import { createRoot, hydrateRoot } from "./compat";

test(createRoot, () => {
  function Custom1() {
    return <div>Custom1</div>;
  }

  function Custom2() {
    return <div>Custom2</div>;
  }

  const el = document.createElement("main");
  const root = createRoot(el);
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

  root.render(
    <div>
      <div>1</div>
      <div>2</div>
      <Custom1 />
      <Custom2 />
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
          Custom1
        </div>
        <div>
          Custom2
        </div>
      </div>
    </main>
  `);
});

test(hydrateRoot, () => {
  function Custom1() {
    return <div>Custom1</div>;
  }

  function Custom2() {
    return <div>Custom2</div>;
  }

  const el = document.createElement("main");
  createRoot(el).render(
    <div>
      <div>Test</div>
      <div>hey</div>
    </div>
  );
  const root = hydrateRoot(
    el,
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

  root.render(
    <div>
      <div>1</div>
      <div>2</div>
      <Custom1 />
      <Custom2 />
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
          Custom1
        </div>
        <div>
          Custom2
        </div>
      </div>
    </main>
  `);
});
