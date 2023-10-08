import type { RequestHandler } from "@hattip/compose";
import { renderToString } from "@hiogawa/tiny-react";
import { tinyassert } from "@hiogawa/utils";
import { viteDevServer } from "@hiogawa/vite-import-dev-server/runtime";
import { Root } from "../routes";
import { requestContextStorage } from "./request-context";

export function ssrHandler(): RequestHandler {
  return async (ctx) => {
    if (ctx.url.pathname !== "/") {
      return new Response("Not found", { status: 404 });
    }

    const ssrHtml = requestContextStorage.run(ctx, () =>
      renderToString(<Root />)
    );
    let html = await importIndexHtml();
    html = html.replace("<!--@INJECT_SSR@-->", ssrHtml);
    return new Response(html, {
      headers: [["content-type", "text/html"]],
    });
  };
}

async function importIndexHtml(): Promise<string> {
  if (import.meta.env.DEV) {
    const html = (await import("/index.html?raw")).default;
    tinyassert(viteDevServer, "forgot 'importDevServerPlugin'?");
    return viteDevServer.transformIndexHtml("/", html);
  } else {
    return (await import("/dist/client/index.html?raw")).default;
  }
}
