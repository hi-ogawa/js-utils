import fs from "node:fs";
import test, { type Page, expect } from "@playwright/test";

export const testNoJs = test.extend({
  // @ts-ignore `pnpm tsc-dev` complains though it's fine on vscode
  javaScriptEnabled: ({}, use) => use(false),
});

export function createFileEditor(filepath: string) {
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

export async function waitForHydration(page: Page) {
  await expect(page.getByText("[hydrated: true]")).toBeVisible();
}
