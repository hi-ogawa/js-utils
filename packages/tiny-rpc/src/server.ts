import { tinyassert } from "@hiogawa/utils";
import type { FnRecord } from "./common";

export function createServerHandler({
  endpoint,
  fnRecord,
}: {
  endpoint: string;
  fnRecord: FnRecord;
}) {
  return async ({ url, request }: { url: URL; request: Request }) => {
    tinyassert(url.pathname.startsWith(endpoint));
    tinyassert(request.method === "POST");

    const path = url.pathname.slice(endpoint.length + 1);
    const fn = fnRecord[path];
    tinyassert(fn);

    const requestJson: unknown = JSON.parse(await request.json());
    tinyassert(requestJson);
    tinyassert(typeof requestJson === "object");
    tinyassert("input" in requestJson);

    const output = await fn(requestJson.input);
    return new Response(JSON.stringify({ output }), {
      headers: {
        "content-type": "application/json",
      },
    });
  };
}
