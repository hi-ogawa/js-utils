import { describe, expect, it } from "vitest";
import { h, render } from "./core";

describe(render, () => {
  it("basic", async () => {
    const el = document.createElement("main");
    render(h("div", {}), el);
    expect(el).toMatchInlineSnapshot('<main />');
  });
});
