import { h, useEffect, useState } from "@hiogawa/tiny-react";
import {
  createHmrComponent,
  createHmrRegistry,
  setupHmr,
} from "@hiogawa/tiny-react/hmr";

// TODO: ast transform to inject hmr

const registry = createHmrRegistry({
  h,
  useState,
  useEffect,
});

// TODO: changing HmrChild implementation here shouldn't reset state in HmrTest
export const HmrChild = createHmrComponent(
  registry,
  function HmrChild(props: { value: number }) {
    // TODO: somehow `props.value` resets to `0`
    //       it might be a bug in reconciler...
    console.log("== HmrChild", props);
    return h.div({}, props.value + 123);
  }
);

if (import.meta.hot) {
  setupHmr(import.meta.hot, registry);
  import.meta.hot.accept(); // need exact string for vite to recognize
}
