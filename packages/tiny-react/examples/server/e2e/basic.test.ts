import { type Page, expect, test } from "@playwright/test";
import { createFileEditor, testNoJs, waitForHydration } from "./helper";

test("basic @js", async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page);
  await page.getByText("Count: 0").click();
  await page.getByRole("button", { name: "+" }).click();
  await page.getByText("Count: 1").click();
  await page.getByRole("button", { name: "-" }).click();
  await page.getByText("Count: 0").click();
  await page.getByText("typeof window: undefined").click();
  await page
    .getByText(
      "[props.serverNode: [props.clientNode: [props.serverNode: [props.clientNode: ]]]]",
    )
    .click();
});

testNoJs("basic @nojs", async ({ page }) => {
  await page.goto("/");
  await page.getByText("Count: 0").click();
  await page.getByText("typeof window: undefined").click();
  await page
    .getByText(
      "[props.serverNode: [props.clientNode: [props.serverNode: [props.clientNode: ]]]]",
    )
    .click();
});

test("navigation @js", async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page);
  await testNavigation(page, { js: true });
});

testNoJs("navigation @nojs", async ({ page }) => {
  await page.goto("/");
  await testNavigation(page, { js: false });
});

async function testNavigation(page: Page, options: { js: boolean }) {
  await page.getByPlaceholder("test-input").fill("hello");
  await page.getByRole("link", { name: "Test" }).click();
  await page.waitForURL("/test");
  await page.getByRole("heading", { name: "Test page" }).click();
  await page.getByText("Another Client Component").click();
  await expect(page.getByPlaceholder("test-input")).toHaveValue(
    options.js ? "hello" : "",
  );
}

test("hmr @dev", async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page);

  await page.getByText("Count: 0").click();
  await page.getByRole("button", { name: "+" }).click();
  await page.getByText("Count: 1").click();

  await page.getByText("Hello Client Component").click();

  using file = createFileEditor("src/routes/_client.tsx");
  file.edit((s) =>
    s.replace("Hello Client Component", "Hello [EDIT] Client Component"),
  );
  await page.getByText("Hello [EDIT] Client Component").click();
  await page.getByText("Count: 1").click();
});
