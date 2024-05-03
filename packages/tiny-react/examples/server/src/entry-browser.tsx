import { deserializeNode, hydrate } from "@hiogawa/tiny-react";
import { tinyassert } from "@hiogawa/utils";

declare let __snode: any;

function main() {
  const vnode = deserializeNode(__snode, {});
  const el = document.getElementById("root");
  tinyassert(el);
  hydrate(vnode, el);
}

main();
