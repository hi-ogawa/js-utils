import fs from "node:fs";
import { test } from "@playwright/test";

test("hmr", async ({ page }) => {
  await page.goto("/");
  await page.locator("#inner1").getByText("props.value + 100 = 100").click();
  await page.locator("#inner2").getByText("props.value + 100 = 100").click();

  await page.getByRole("button", { name: "+1" }).click();
  await page.locator("#inner1").getByText("props.value + 100 = 101").click();
  await page.locator("#inner2").getByText("props.value + 100 = 101").click();

  await editFile("src/app.tsx", (code) => code);
  await page.locator("#inner1").getByText("props.value + 100 = 101").click();
  await page.locator("#inner2").getByText("props.value + 100 = 101").click();
});

async function editFile(filepath: string, edit: (content: string) => string) {
  const content = await fs.promises.readFile(filepath, "utf-8");
  await fs.promises.writeFile(filepath, edit(content));
}
