import { createManualPromise, range, tinyassert } from "@hiogawa/utils";

// TODO: study prior art
// - react-router/remix loader defer
// - https://github.com/jacob-ebey/turbo-stream
// - https://github.com/lxsmnsyc/seroval

// TODO: integrate custom encoding in index.ts

export function stringifyStream(input: unknown): ReadableStream<string> {
  let cancelled = false;
  const stream = new ReadableStream<string>({
    start(controller) {
      // synchronsly serialize to non-promise skelton
      const promises: Promise<unknown>[] = [];
      const skelton = JSON.stringify(input, function (_k, v) {
        if (v instanceof Promise) {
          promises.push(v);
          return "!__promise__"; // TODO: conflict-free encoding
        }
        return v;
      });

      // write skelton at first line
      controller.enqueue(skelton + "\n");

      // send promise as it resolves
      promises.forEach((promise, i) => {
        promise.then(
          (data) => {
            if (cancelled) return;
            // TODO: recursively encode data
            controller.enqueue(
              JSON.stringify({ type: "resolve", i, data }) + "\n"
            );
          },
          (data) => {
            if (cancelled) return;
            controller.enqueue(
              JSON.stringify({ type: "reject", i, data }) + "\n"
            );
          }
        );
      });

      Promise.allSettled(promises).then(() => {
        controller.close();
      });
    },
    cancel() {
      cancelled = true;
    },
  });
  return stream;
}

export async function parseStream(
  stream: ReadableStream<string>
): Promise<[unknown, Promise<void>, Promise<unknown>[]]> {
  // read line by line
  stream = stream.pipeThrough(splitLineTransform());

  // read skelton at first line
  const reader = stream.getReader();
  const result = await reader.read();
  tinyassert(!result.done);
  const skelton = result.value;

  // fill in manual promises
  const promises: ReturnType<typeof createManualPromise>[] = [];
  const output: unknown = JSON.parse(skelton, function (_k, v) {
    if (typeof v === "string" && v === "!__promise__") {
      const manual = createManualPromise();
      promises.push(manual);
      return manual.promise;
    }
    return v;
  });

  // resolve promises as it receives
  const done = (async () => {
    for (let _ of range(promises.length)) {
      const result = await reader.read();
      tinyassert(!result.done);
      const { type, i, data } = JSON.parse(result.value);
      if (type === "resolve") {
        promises[i].resolve(data);
      } else if (type === "reject") {
        promises[i].reject(data);
      } else {
        throw new Error("unreachable");
      }
    }
    const result = await reader.read();
    tinyassert(result.done);
    reader.releaseLock();
  })();

  // return raw promises
  const rawPromises = promises.map((p) => p.promise);

  return [output, done, rawPromises];
}

function splitLineTransform() {
  let acc = "";
  return new TransformStream<string, string>({
    transform(chunk, controller) {
      acc += chunk;
      if (acc.includes("\n")) {
        const lines = acc.split("\n");
        acc = lines.pop()!;
        for (const line of lines) {
          controller.enqueue(line);
        }
      }
    },
  });
}
