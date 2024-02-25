import { tinyassert } from "@hiogawa/utils";
import { parseStream } from "./lib";

const $ = document.querySelector.bind(document);

$("#api").addEventListener("click", async () => {
  // fetch stream
  const res = await fetch("/api");
  tinyassert(res.body);
  const stream = res.body.pipeThrough(new TextDecoderStream());

  // parse and update as it resolves
  const [output, done, promises] = await parseStream(stream);

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
    $("#output").textContent = JSON.stringify(output, null, 2);
  }

  await done;
  console.log("[stream] done");
});
