import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Compose } from "./compose";
import { Debug } from "./debug";

describe("Debug", () => {
  it("basic", () => {
    const el = <Debug debug={{ hello: "world" }} />;
    expect(renderToStaticMarkup(el)).toMatchInlineSnapshot(`
      "<details><summary>debug</summary><pre>{
        &quot;hello&quot;: &quot;world&quot;
      }</pre></details>"
    `);
  });
});

describe("Compose", () => {
  it("basic", () => {
    function Wrapper(props: JSX.IntrinsicElements["div"]) {
      return <div {...props}>{props.children}</div>;
    }

    const el = (
      <Compose
        elements={[
          <Wrapper className="wrapper-1" />,
          <Wrapper className="wrapper-2" />,
          <button>inner</button>,
        ]}
      />
    );
    expect(renderToStaticMarkup(el)).toMatchInlineSnapshot(
      '"<div class=\\"wrapper-1\\"><div class=\\"wrapper-2\\"><button></button></div></div>"'
    );
  });
});
