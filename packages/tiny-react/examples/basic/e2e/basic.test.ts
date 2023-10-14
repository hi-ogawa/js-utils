import { test } from "@playwright/test";

test("basic", async ({ page }) => {
  await page.goto("/");

  // test input state
  await page.getByText('debug: {"values":["0","1","2"]}').click();
  await page.getByLabel('input (0)').fill('123');
  await page.getByText('debug: {"values":["123","1","2"]}').click();
  await page.getByLabel('input (2)').fill('456');
  await page.getByText('debug: {"values":["123","1","456"]}').click();
  await page.getByLabel('input (1)').fill('');
  await page.getByText('debug: {"values":["123","","456"]}').click();

  // TestSetStateInEffect
  await page.getByText('{"state":0,"state2":0,"render":1}').click();
  await page.getByTestId('TestSetStateInEffect').getByRole('button', { name: '+1' }).click();
  await page.getByTestId('TestSetStateInEffect').getByRole('button', { name: '+1' }).click();
  await page.getByText('{"state":2,"state2":4,"render":5}').click();
  await page.getByTestId('TestSetStateInEffect').getByRole('button', { name: '-1' }).click();
  await page.getByTestId('TestSetStateInEffect').getByRole('button', { name: '-1' }).click();
  await page.getByText('{"state":0,"state2":0,"render":9}').click();
  await page.getByTestId('TestSetStateInEffect').getByRole('button', { name: '-1' }).click();
  await page.getByText('{"state":-1,"state2":-2,"render":11}').click();
});
