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

// changing HmrChild implementation here shouldn't reset state in HmrTest
export const HmrChild = createHmrComponent(
  registry,
  function HmrChild(props: { value: number }) {
    return h.div({}, props.value);
  }
);

if (import.meta.hot) {
  setupHmr(import.meta.hot, registry);
  import.meta.hot.accept(); // need exact string for vite to recognize
}
