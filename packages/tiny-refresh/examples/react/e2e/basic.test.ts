import fs from "node:fs";
import { sleep } from "@hiogawa/utils";
import { type Page, expect, test } from "@playwright/test";

test("basic", async ({ page }) => {
  await page.goto("/");
  await using _reloadChecker = await createReloadChecker(page);

  await page.getByText("[Outer] = 0").click();
  await page.locator("#inner1").getByText("Inner: [Outer] + 100 = 100").click();
  await page.locator("#inner2").getByText("Inner: [Outer] + 100 = 100").click();

  await page.getByRole("button", { name: "+" }).first().click();
  await page.getByText("[Outer] = 1").click();
  await page.locator("#inner1").getByText("Inner: [Outer] + 100 = 101").click();
  await page.locator("#inner2").getByText("Inner: [Outer] + 100 = 101").click();

  using file = createFileEditor("src/app.tsx");
  file.edit((s) =>
    s.replace("const innerAdd = 100;", "const innerAdd = 1000;"),
  );
  await page
    .locator("#inner1")
    .getByText("Inner: [Outer] + 1000 = 1001")
    .click();
  await page
    .locator("#inner2")
    .getByText("Inner: [Outer] + 1000 = 1001")
    .click();
  await page.getByText("[Outer] = 1").click();
});

test("hook change", async ({ page }) => {
  await page.goto("/");
  await using _reloadChecker = await createReloadChecker(page);

  await page.getByText("[Outer] = 0").click();
  await page.locator("#inner1").getByText("Inner: [Outer] + 100 = 100").click();
  await page.locator("#inner2").getByText("Inner: [Outer] + 100 = 100").click();

  await page.getByRole("button", { name: "+" }).first().click();
  await page.getByText("[Outer] = 1").click();
  await page.locator("#inner1").getByText("Inner: [Outer] + 100 = 101").click();
  await page.locator("#inner2").getByText("Inner: [Outer] + 100 = 101").click();

  using file = createFileEditor("src/app.tsx");
  file.edit((s) =>
    s
      .replace("useState(0);", "useState(0);useState(0);")
      .replace("[Outer] =", "[Outer(EDIT)] ="),
  );
  await page.getByText("[Outer(EDIT)] = 0").click();
  await page.locator("#inner1").getByText("Inner: [Outer] + 100 = 100").click();
  await page.locator("#inner2").getByText("Inner: [Outer] + 100 = 100").click();
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
    s.replace(`const message = "hello"`, `const message = "hey"`),
  );
  await expect(page.getByTestId("show-hide-message")).toHaveText("[]");
  await page.getByRole("button", { name: "show/hide" }).click();
  await expect(page.getByTestId("show-hide-message")).toHaveText("[hey]");
  await page.getByRole("button", { name: "show/hide" }).click();
  await expect(page.getByTestId("show-hide-message")).toHaveText("[]");
});

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
