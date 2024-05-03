import {
  deserializeNode,
  renderToString,
  serializeNode,
} from "@hiogawa/tiny-react";
import type { ViteDevServer } from "vite";
import Page from "./routes/page";

export async function handler(_request: Request) {
  // serialize server component
  // @ts-ignore;
  const rnode = <Page />;
  // @ts-ignore
  const snode = await serializeNode(rnode);

  // TODO: reference map
  // TODO: handoff snode to clent for hydration
  const vnode = deserializeNode(snode, {});
  const ssrHtml = renderToString(vnode);

  let html = await importHtmlTemplate();
  html = html.replace("<body>", `<body><div id="root">${ssrHtml}</div>`);
  return new Response(html, {
    headers: {
      "content-type": "text/html",
    },
  });
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
