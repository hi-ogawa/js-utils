import "./style.css";
import {
  type SerializeResult,
  deserializeNode,
  hydrateRoot,
} from "@hiogawa/tiny-react";
import { tinyassert } from "@hiogawa/utils";
import { createReferenceMap } from "./integration/client-reference/runtime";

declare let __serialized: SerializeResult;

async function main() {
  if (window.location.href.includes("__nojs")) {
    return;
  }

  // hydrate with initial SNode
  const vnode = deserializeNode(
    __serialized.snode,
    await createReferenceMap(__serialized.referenceIds)
  );
  const el = document.getElementById("root");
  tinyassert(el);
  const root = hydrateRoot(el, vnode);

  // re-render on client side navigation
  async function onNavigation() {
    const url = new URL(window.location.href);
    url.searchParams.set("__serialize", "");
    const res = await fetch(url);
    tinyassert(res.ok);
    const result: SerializeResult = await res.json();
    const newVnode = deserializeNode(
      result.snode,
      await createReferenceMap(result.referenceIds)
    );
    root.render(newVnode);
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
    onNavigation();
    return res;
  };
}

main();
