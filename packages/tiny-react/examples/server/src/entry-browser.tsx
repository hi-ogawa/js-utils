import { deserializeNode, hydrate } from "@hiogawa/tiny-react";
import { tinyassert } from "@hiogawa/utils";
import { referenceMap } from "./routes/_client";

declare let __snode: any;

function main() {
  const vnode = deserializeNode(__snode, referenceMap);
  const el = document.getElementById("root");
  tinyassert(el);
  hydrate(vnode, el);
}

main();
