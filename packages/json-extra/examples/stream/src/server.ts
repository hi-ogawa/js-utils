import type { IncomingMessage, OutgoingMessage } from "node:http";
import nodeStream from "node:stream";
import { sleep } from "@hiogawa/utils";
import { stringifyStream } from "./lib";

export default function handler(
  req: IncomingMessage,
  res: OutgoingMessage,
  next: () => void
) {
  if (req.url === "/api") {
    const stream = stringifyStream([
      sleep(2000).then(() => "a"),
      sleep(1000).then(() => "b"),
      sleep(4000).then(() => "c"),
      sleep(3000).then(() => "d"),
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
  <pre id="output"></pre>
</div>
`;
