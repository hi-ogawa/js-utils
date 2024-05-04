import "./style.css";
import { deserializeNode, hydrate, render } from "@hiogawa/tiny-react";
import { tinyassert } from "@hiogawa/utils";
import * as referenceMap from "./routes/_client";

declare let __snode: any;

function main() {
  // hydrate with initial SNode
  const vnode = deserializeNode(__snode, referenceMap);
  const el = document.getElementById("root");
  tinyassert(el);
  const bnode = hydrate(vnode, el);

  // re-render on client side navigation
  async function onNavigation() {
    const url = new URL(window.location.href);
    url.searchParams.set("__snode", "");
    const res = await fetch(url);
    tinyassert(res.ok);
    const newSnode = await res.json();
    const newVnode = deserializeNode(newSnode, referenceMap);
    tinyassert(el);
    render(newVnode, el, bnode);
  }

  // cf. https://github.com/TanStack/router/blob/7095f9e5af79ff98d5a1cad126c2d7d9eacfa253/packages/history/src/index.ts#L301-L314
  window.addEventListener("pushstate", onNavigation);
  window.addEventListener("popstate", onNavigation);

  const oldPushState = window.history.pushState;
  window.history.pushState = function (...args) {
    const res = oldPushState.apply(this, args);
    onNavigation();
    return res;
  };

  const oldReplaceState = window.history.replaceState;
  window.history.replaceState = function (...args) {
    const res = oldReplaceState.apply(this, args);
    onNavigation;
    return res;
  };
}

main();
