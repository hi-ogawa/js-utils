import { h, useEffect, useState } from "@hiogawa/tiny-react";
import {
  createHmrComponent,
  createHmrRegistry,
  setupHmr,
} from "@hiogawa/tiny-react/hmr";

// TODO: ast transform to inject hmr

// TODO: start with semi-automatic injection based on manual flag via speical comment?
/* @tiny-react.hmr HmrChild */

const registry = createHmrRegistry({
  h,
  useState,
  useEffect,
});

// changing HmrChild implementation here shouldn't reset state in HmrTest
export const HmrChild = createHmrComponent(
  registry,
  function HmrChild(props: { counter: number }) {
    const add = 100;
    return (
      <div className="flex flex-col gap-1">
        <h2 className="text-lg">HmrChild</h2>
        <span>
          Counter + {add} = {props.counter + add}
        </span>
        <span className="text-colorTextSecondary text-sm">
          Changing 'HmrChild' internal (e.g. changing from '+ 100' to '+ 10')
          should preserve the counter state of parent 'TestHmr'
        </span>
      </div>
    );
  }
);

if (import.meta.hot) {
  setupHmr(import.meta.hot, registry);

  // source code needs to include exact import.meta expression for vite's static analysis
  () => import.meta.hot?.accept();
}
