import type { IncomingMessage, OutgoingMessage } from "node:http";
import nodeStream from "node:stream";
import { stringifyStream } from "@hiogawa/json-extra";
import { sleep } from "@hiogawa/utils";

export default function handler(
  req: IncomingMessage,
  res: OutgoingMessage,
  next: () => void
) {
  if (req.url === "/api") {
    const stream = stringifyStream([
      "fast1",
      sleep(1000).then(() => "a"),
      { slow: sleep(3000).then(() => "c") },
      { foo: "fast2" },
      { deep: [sleep(2000).then(() => "b")] },
    ]);
    res.setHeader("content-type", "text/plain");
    nodeStream.Readable.fromWeb(stream as any).pipe(res);
    return;
  }
  if (req.url === "/") {
    res.setHeader("content-type", "text/html").end(HTML_TEMPLATE);
    return;
  }
  next();
}

const HTML_TEMPLATE = `
<script type="module" src="/@vite/client"></script>
<script src="/src/client.ts" type="module"></script>
<div>
  <button id="api">Fetch Stream</button>
  <h5>output json:</h5>
  <pre id="output-json"></pre>
  <h5>output raw:</h5>
  <pre id="output-raw"></pre>
</div>
`;
