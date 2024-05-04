import test from "@playwright/test";

export const testNoJs = test.extend({
  javaScriptEnabled: ({}, use) => use(false),
});
