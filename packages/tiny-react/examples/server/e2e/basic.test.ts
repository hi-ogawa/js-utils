import { type Page, expect, test } from "@playwright/test";
import { testNoJs } from "./helper";

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

async function waitForHydration(page: Page) {
  await expect(page.getByText("[hydrated: true]")).toBeVisible();
}
