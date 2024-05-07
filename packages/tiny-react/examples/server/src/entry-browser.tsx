import "./style.css";
import {
  type SerializeResult,
  type VNode,
  deserialize,
  hydrateRoot,
  useEffect,
  useState,
} from "@hiogawa/tiny-react";
import { tinyassert } from "@hiogawa/utils";
import { createReferenceMap } from "./integration/client-reference/runtime";

async function main() {
  if (window.location.href.includes("__nojs")) {
    return;
  }

  function Root(props: { data: VNode }) {
    const [data, setData] = useState(props.data);

    // replace root on client side navigation
    useEffect(() => {
      return listenHistory(async () => {
        const url = new URL(window.location.href);
        url.searchParams.set("__serialize", "");
        const res = await fetch(url);
        tinyassert(res.ok);
        const result: SerializeResult = await res.json();
        const newVnode = deserialize<VNode>(
          result.data,
          await createReferenceMap(result.referenceIds),
        );
        setData(newVnode);
      });
    }, []);

    return data;
  }

  // hydrate with initial SNode
  const initResult: SerializeResult = (globalThis as any).__serialized;
  const vnode = deserialize<VNode>(
    initResult.data,
    await createReferenceMap(initResult.referenceIds),
  );
  const el = document.getElementById("root");
  tinyassert(el);
  hydrateRoot(el, <Root data={vnode} />);
}

// cf. https://github.com/TanStack/router/blob/7095f9e5af79ff98d5a1cad126c2d7d9eacfa253/packages/history/src/index.ts#L301-L314
function listenHistory(onNavigation: () => void) {
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

  return () => {
    window.removeEventListener("pushstate", onNavigation);
    window.removeEventListener("popstate", onNavigation);
    window.history.pushState = oldPushState;
    window.history.replaceState = oldReplaceState;
  };
}

main();
