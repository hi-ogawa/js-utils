import { test } from "@playwright/test";
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
      "[props.serverNode: [props.clientNode: [props.serverNode: [props.clientNode: ]]]]"
    )
    .click();
});

testNoJs("basic @nojs", async ({ page }) => {
  await page.goto("/");
  await page.getByText("typeof window: undefined").click();
  await page
    .getByText(
      "[props.serverNode: [props.clientNode: [props.serverNode: [props.clientNode: ]]]]"
    )
    .click();
});

test("hmr @dev", async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page);

  await page.getByText("Count: 0").click();
  await page.getByRole("button", { name: "+" }).click();
  await page.getByText("Count: 1").click();

  await page.getByText("Hello Client Component").click();

  // TODO: update prettier to use `using`
  const file = createFileEditor("src/routes/_client.tsx");
  file.edit((s) =>
    s.replace("Hello Client Component", "Hello [EDIT] Client Component")
  );
  await page.getByText("Hello [EDIT] Client Component").click();
  await page.getByText("Count: 1").click();
  file[Symbol.dispose]();
});
