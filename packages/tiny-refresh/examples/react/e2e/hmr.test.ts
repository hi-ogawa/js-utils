import fs from "node:fs";
import { sleep } from "@hiogawa/utils";
import { type Page, expect, test } from "@playwright/test";

test("basic", async ({ page }) => {
  await page.goto("/");
  await using _reloadChecker = await createReloadChecker(page);
});

test("hook change", async ({ page }) => {
  await page.goto("/");
  await using _reloadChecker = await createReloadChecker(page);
});

test.skip("hmr basic", async ({ page }) => {
  await page.goto("/");
  await using _reloadChecker = await createReloadChecker(page);

  async function increment() {
    await page.getByRole("button", { name: "+1" }).first().click();
  }

  async function checkInner(value: number, add: number) {
    const text = `Inner: counter + ${add} = ${value + add}`;
    await page.locator("#inner1").getByText(text).click();
    await page.locator("#inner2").getByText(text).click();
  }

  await checkInner(0, 100);

  // increment
  await increment();
  await checkInner(1, 100);

  // updating 'Inner'
  await withEditFile(
    "src/app.tsx",
    (code) => code.replace("const add = 100;", "const add = 1000;"),
    () => checkInner(1, 1000)
  );
  await checkInner(1, 100);

  // updating 'Outer'
  await withEditFile(
    "src/app.tsx",
    (code) => code.replace("<h1>outer</h1>", "<h2>outer</h2>"),
    async () => {
      await page.locator("h2").getByText("outer").click();
      await checkInner(1, 100);
    }
  );
  await checkInner(1, 100);

  // increment
  await increment();
  await checkInner(1, 100);

  await withEditFile(
    "src/app.tsx",
    (code) =>
      code.replace(
        "export function Outer()",
        "// @hmr-unsafe\nexport function Outer()"
      ),
    async () => {
      // reset
      await checkInner(0, 100);

      // increment
      await increment();
      await checkInner(1, 100);

      // update 'Outer' (make increment double)
      await withEditFile(
        "src/app.tsx",
        (code) => code.replace("(prev) => prev + 1", "(prev) => prev + 2"),
        async () => {
          // state is preserved
          await checkInner(1, 100);

          // increment
          await increment();
          await checkInner(3, 100);

          // update 'Inner'
          await withEditFile(
            "src/app.tsx",
            (code) => code.replace("const add = 100;", "const add = 1000;"),
            () => checkInner(3, 1000)
          );
        }
      );
    }
  );
});

test("show/hide", async ({ page }) => {
  await page.goto("/");
  await using _reloadChecker = await createReloadChecker(page);

  await expect(page.getByTestId("show-hide-message")).toHaveText("[]");
  await page.getByRole("button", { name: "show/hide" }).click();
  await expect(page.getByTestId("show-hide-message")).toHaveText("[hello]");
  await page.getByRole("button", { name: "show/hide" }).click();
  await expect(page.getByTestId("show-hide-message")).toHaveText("[]");

  // update message
  using file = createFileEditor("src/other-file.tsx");
  file.edit((s) =>
    s.replace(`const message = "hello"`, `const message = "hey"`)
  );
  await expect(page.getByTestId("show-hide-message")).toHaveText("[]");
  await page.getByRole("button", { name: "show/hide" }).click();
  await expect(page.getByTestId("show-hide-message")).toHaveText("[hey]");
  await page.getByRole("button", { name: "show/hide" }).click();
  await expect(page.getByTestId("show-hide-message")).toHaveText("[]");
});

async function withEditFile(
  filepath: string,
  edit: (content: string) => string,
  callback: () => void | Promise<void>
) {
  const revert = await editFile(filepath, edit);
  try {
    await callback();
  } finally {
    await revert();
  }
}

async function editFile(filepath: string, edit: (content: string) => string) {
  const content = await fs.promises.readFile(filepath, "utf-8");
  await fs.promises.writeFile(filepath, edit(content));
  return async () => {
    await fs.promises.writeFile(filepath, content);
  };
}

function createFileEditor(filepath: string) {
  let init = fs.readFileSync(filepath, "utf-8");
  let data = init;
  return {
    edit(editFn: (data: string) => string) {
      data = editFn(data);
      fs.writeFileSync(filepath, data);
    },
    [Symbol.dispose]() {
      fs.writeFileSync(filepath, init);
    },
  };
}

async function createReloadChecker(page: Page) {
  async function reset() {
    await page.evaluate(() => {
      const el = document.createElement("meta");
      el.setAttribute("name", "x-reload-check");
      document.head.append(el);
    });
  }

  async function check() {
    await sleep(300);
    await expect(page.locator(`meta[name="x-reload-check"]`)).toBeAttached({
      timeout: 1,
    });
  }

  await reset();

  return {
    check,
    reset,
    [Symbol.asyncDispose]: check,
  };
}
