import "virtual:uno.css";
import { hydrate } from "@hiogawa/tiny-react";
import { tinyassert } from "@hiogawa/utils";
import { Root } from "../routes";

function main() {
  const el = document.getElementById("root");
  tinyassert(el);
  hydrate(<Root />, el);
}

main();
