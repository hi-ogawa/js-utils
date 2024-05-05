import {
  deserializeNode,
  registerClientReference,
  renderToString,
  serializeNode,
} from "@hiogawa/tiny-react";
import type { ViteDevServer } from "vite";
import * as referenceMap from "./routes/_client";
import Layout from "./routes/layout";

// TODO: tranform
for (const [name, Component] of Object.entries(referenceMap)) {
  registerClientReference(Component, name);
}

export async function handler(request: Request) {
  // serialize server component
  const url = new URL(request.url);
  const snode = await serializeNode(<Router url={url} />);

  // to CSR
  if (url.searchParams.has("__snode")) {
    return new Response(JSON.stringify(snode, null, 2), {
      headers: {
        "content-type": "application/json",
      },
    });
  }

  // to SSR
  const vnode = deserializeNode(snode, referenceMap);
  const ssrHtml = renderToString(vnode);

  let html = await importHtmlTemplate();
  html = html.replace("<body>", () => `<body><div id="root">${ssrHtml}</div>`);
  html = html.replace(
    "<head>",
    () => `<head><script>globalThis.__snode = ${JSON.stringify(snode)}</script>`
  );
  // dev only FOUC fix
  if (import.meta.env.DEV) {
    html = html.replace(
      "<head>",
      `<head><link rel="stylesheet" href="/src/style.css?direct" />`
    );
  }
  return new Response(html, {
    headers: {
      "content-type": "text/html",
    },
  });
}

async function Router({ url }: { url: URL }) {
  const routes = {
    "/": () => import("./routes/page"),
    "/test": () => import("./routes/test/page"),
  };
  const route = routes[url.pathname as "/"];
  let node = <div>Not Found</div>;
  if (route) {
    const Page = (await route()).default;
    node = <Page />;
  }
  return <Layout>{node}</Layout>;
}

declare let __vite_server: ViteDevServer;

async function importHtmlTemplate() {
  let html: string;
  if (import.meta.env.DEV) {
    html = (await import("/index.html?raw")).default;
    html = await __vite_server.transformIndexHtml("/", html);
  } else {
    html = (await import("/dist/client/index.html?raw")).default;
  }
  return html;
}
