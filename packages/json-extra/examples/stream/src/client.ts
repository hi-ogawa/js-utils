import { tinyassert } from "@hiogawa/utils";
import { parseStream } from "./lib";

const $ = document.querySelector.bind(document);

$("#api").addEventListener("click", async () => {
  // fetch stream
  const res = await fetch("/api");
  tinyassert(res.body);
  const stream = res.body.pipeThrough(new TextDecoderStream());

  // copy stream to display raw data
  const [stream1, stream2] = stream.tee();

  let raw = "";
  stream2.pipeTo(
    new WritableStream({
      write(chunk) {
        raw += chunk;
        $("#output-raw").textContent = raw;
      },
    })
  );

  // parse and update as it resolves
  const [output, done, promises] = await parseStream(stream1);

  // monkey patch toJSON
  for (const promise of promises) {
    let status = "<pending>";
    (promise as any).toJSON = () => {
      return `Promise { ${status} }`;
    };
    promise.then(
      (v) => {
        status = `<fulfilled>: ${v}`;
        render();
      },
      (v) => {
        status = `<rejected>: ${v}`;
        render();
      }
    );
  }

  render();

  function render() {
    $("#output-json").textContent = JSON.stringify(output, null, 2);
  }

  await done;
  console.log("[stream] done");
});
