import fs from "node:fs";
import { test } from "@playwright/test";

test("hmr", async ({ page }) => {
  await page.goto("/");

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

  // updating 'Inner' keeps 'Outer' state
  await withEditFile(
    "src/app.tsx",
    (code) => code.replace("const add = 100;", "const add = 1000;"),
    () => checkInner(1, 1000)
  );
  await checkInner(1, 100);

  // updating 'Outer' resets state
  await withEditFile(
    "src/app.tsx",
    (code) => code.replace("<h1>outer</h1>", "<h2>outer</h2>"),
    async () => {
      await page.locator("h2").getByText("outer").click();
      await checkInner(0, 100);
    }
  );
  await checkInner(0, 100);

  // increment
  await increment();
  await checkInner(1, 100);

  // add @hmr-unsafe
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
