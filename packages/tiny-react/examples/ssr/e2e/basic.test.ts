import { tinyassert } from "@hiogawa/utils";
import { Page, expect, test } from "@playwright/test";

test("event listener", async ({ page }) => {
  await page.goto("/");
  await waitHydrated(page);

  await page.getByRole("button", { name: "Hello!" }).click();
  await page.getByRole("button", { name: "World!" }).click();
  await page.getByRole("button", { name: "Hello!" }).click();
});

test("url", async ({ page }) => {
  await page.goto("/");
  await waitHydrated(page);

  await page.getByPlaceholder("?q=...").fill("hello");
  await page.waitForURL("/?q=hello");

  await page.reload();
  await waitHydrated(page);
  await expect(page.getByPlaceholder("?q=...")).toHaveValue("hello");
  await page.waitForURL("/?q=hello");
});

test("ssr", async ({ request }) => {
  {
    const res = await request.get("/");
    tinyassert(res.ok);

    const text = await res.text();
    expect(text).toContain(
      `<input class="antd-input px-1" placeholder="?q=..." value=""/>`
    );
  }

  {
    const res = await request.get("/?q=hello");
    tinyassert(res.ok);

    const text = await res.text();
    expect(text).toContain(
      `<input class="antd-input px-1" placeholder="?q=..." value="hello"/>`
    );
  }
});

async function waitHydrated(page: Page) {
  await page.getByTestId("hydrated").waitFor();
}
