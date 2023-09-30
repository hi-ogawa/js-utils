import "virtual:uno.css";
import { render } from "@hiogawa/tiny-react";
import { tinyassert } from "@hiogawa/utils";
import { App } from "./app";

function main() {
  const el = document.getElementById("root");
  tinyassert(el);
  el.innerHTML = "";
  render(<App />, el);
}

main();
