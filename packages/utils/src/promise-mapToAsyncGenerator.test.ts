import { describe, expect, it } from "vitest";
import { range } from "./lodash";
import { mapToAsyncGenerator } from "./promise";
import { wrapErrorAsync } from "./result";

describe(mapToAsyncGenerator, () => {
  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(() => resolve(null), ms));
  }

  async function arrayFromAsyncGenerator<T>(
    generator: AsyncGenerator<T>
  ): Promise<T[]> {
    const result: T[] = [];
    for await (const v of generator) {
      result.push(v);
    }
    return result;
  }

  it("basic", async () => {
    const generator = mapToAsyncGenerator(
      range(5).reverse(),
      async (v, i) => {
        await sleep(50);
        return { v, i };
      },
      {
        concurrency: 3,
      }
    );

    const result = await arrayFromAsyncGenerator(generator);
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "i": 0,
          "v": 4,
        },
        {
          "i": 1,
          "v": 3,
        },
        {
          "i": 2,
          "v": 2,
        },
        {
          "i": 3,
          "v": 1,
        },
        {
          "i": 4,
          "v": 0,
        },
      ]
    `);
  });

  it("synchronous", async () => {
    const generator = mapToAsyncGenerator(
      range(5).reverse(),
      (v, i) => {
        return { v, i };
      },
      {
        concurrency: 3,
      }
    );

    const result = await arrayFromAsyncGenerator(generator);
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "i": 0,
          "v": 4,
        },
        {
          "i": 1,
          "v": 3,
        },
        {
          "i": 2,
          "v": 2,
        },
        {
          "i": 3,
          "v": 1,
        },
        {
          "i": 4,
          "v": 0,
        },
      ]
    `);
  });

  it("error", async () => {
    const generator = mapToAsyncGenerator(
      range(5),
      async (v) => {
        await sleep(50);
        if (v === 3) {
          throw new Error(`thrown ${v}`);
        }
        return v;
      },
      {
        concurrency: 3,
      }
    );

    let generated: unknown[] = [];
    const result = await wrapErrorAsync(async () => {
      for await (const x of generator) {
        generated.push(x);
      }
    });

    expect(generated).toMatchInlineSnapshot(`
      [
        0,
        1,
        2,
      ]
    `);
    expect(result).toMatchInlineSnapshot(`
      {
        "ok": false,
        "value": [Error: thrown 3],
      }
    `);
  });

  it("sequential", async () => {
    // can easily simulate Promise.all like ordering
    // by storing the result externally with index

    const result: unknown[] = [];

    const generator = mapToAsyncGenerator(
      range(5).reverse(),
      async (v, i) => {
        await sleep(v * 30);
        result[i] = v;
      },
      {
        concurrency: 3,
      }
    );

    await arrayFromAsyncGenerator(generator);

    expect(result).toMatchInlineSnapshot(`
      [
        4,
        3,
        2,
        1,
        0,
      ]
    `);
  });

  it("random", async () => {
    const result: unknown[] = [];

    const generator = mapToAsyncGenerator(
      range(30),
      async (v, i) => {
        await sleep(Math.random() * 100);
        result[i] = v;
      },
      {
        concurrency: 10,
      }
    );

    await arrayFromAsyncGenerator(generator);

    expect(result).toMatchInlineSnapshot(`
      [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
      ]
    `);
  });

  it("concurrency", async () => {
    let inflight = 0;
    const inflightCounts: number[] = [inflight];

    const generator = mapToAsyncGenerator(
      range(30),
      async () => {
        inflightCounts.push(++inflight);
        await sleep(Math.random() * 100);
        inflightCounts.push(--inflight);
      },
      {
        concurrency: 10,
      }
    );

    await arrayFromAsyncGenerator(generator);

    expect(inflightCounts.join(",")).toMatchInlineSnapshot(
      '"0,1,2,3,4,5,6,7,8,9,10,9,10,9,10,9,10,9,10,9,10,9,10,9,10,9,10,9,10,9,10,9,10,9,10,9,10,9,10,9,10,9,10,9,10,9,10,9,10,9,10,9,8,7,6,5,4,3,2,1,0"'
    );
  });
});
