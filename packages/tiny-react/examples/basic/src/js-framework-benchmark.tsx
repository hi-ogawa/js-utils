import { range } from "@hiogawa/utils";
import { useState } from "../../../dist";

// benchmark tasks from https://github.com/krausest/js-framework-benchmark
// @hmr-unsafe
export function JsFrameworkBenchmarkApp() {
  const [selected, setSelected] = useState<number | undefined>(undefined);
  const [n, setN] = useState(1000);
  const [items, setItems] = useState(() => generateItems(0));

  return (
    <div className="border p-2 flex flex-col gap-2">
      <a
        href="https://github.com/krausest/js-framework-benchmark"
        target="_blank"
      >
        <h1 className="text-lg hover:underline">js-framework-benchmark</h1>
      </a>
      <div className="flex flex-col gap-1">
        Parameters
        <label className="flex items-center gap-3 px-2">
          N
          <input
            className="antd-input px-2"
            type="number"
            value={String(n)}
            oninput={(e) => setN(e.currentTarget.valueAsNumber)}
          />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          className="antd-btn antd-btn-default"
          id="run"
          onclick={() => {
            setItems(generateItems(n));
          }}
        >
          Create {n} rows
        </button>
        <button
          className="antd-btn antd-btn-default"
          id="runlots"
          onclick={() => {
            setItems(generateItems(n * 10));
          }}
        >
          Create {n * 10} rows
        </button>
        <button
          className="antd-btn antd-btn-default"
          id="add"
          onclick={() => {
            setItems([...items, ...generateItems(n)]);
          }}
        >
          Append {n} rows
        </button>
        <button
          className="antd-btn antd-btn-default"
          id="update"
          onclick={() => {
            setItems(
              items.map((item, i) =>
                i % 10 === 0 ? { ...item, label: item.label + " !!!" } : item
              )
            );
          }}
        >
          Update every 10th row
        </button>
        <button
          className="antd-btn antd-btn-default"
          id="clear"
          onclick={() => {
            setItems([]);
          }}
        >
          Clear
        </button>
        <button
          className="antd-btn antd-btn-default"
          id="swaprows"
          onclick={() => {
            if (items.length >= 4) {
              const newItems = [...items];
              newItems[1] = items[items.length - 2];
              newItems[items.length - 2] = items[1];
              setItems(newItems);
            }
          }}
        >
          Swap Rows
        </button>
      </div>
      <div className="flex flex-col">
        {items.map((item) => (
          <div
            key={item.id}
            className={cls(
              "flex items-center p-2 px-4 first:border-t-0 border-t hover:bg-colorFillTertiary duration-300",
              selected === item.id && "!bg-colorFillSecondary"
            )}
          >
            <span className="flex-none text-sm text-colorTextSecondary w-[100px]">
              {item.id}
            </span>
            <span
              className="flex-1 cursor-pointer"
              onclick={() => {
                setSelected((prev) => (prev === item.id ? undefined : item.id));
              }}
            >
              {item.label}
            </span>
            <span
              className="antd-btn antd-btn-ghost i-ri-close-line w-5 h-5"
              onclick={() => {
                setItems(items.filter((other) => other.id !== item.id));
              }}
            ></span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ItemData {
  id: number;
  label: string;
}

function cls(...args: unknown[]) {
  return args.filter(Boolean).join(" ");
}

let nextItemId = 0;

function generateItems(n: number) {
  return range(n).map(() => generateItem());
}

function generateItem(): ItemData {
  return {
    id: nextItemId++,
    label: [randomChoice(A), randomChoice(C), randomChoice(N)].join(" "),
  };
}

function randomChoice<T>(ls: T[]): T {
  return ls[Math.floor(Math.random() * ls.length)];
}

// from https://github.com/krausest/js-framework-benchmark/blob/81094680c9898a80295ea9e8d365c609ad754a03/frameworks/keyed/react-hooks/src/main.jsx#L6-L10
const A = [
  "pretty",
  "large",
  "big",
  "small",
  "tall",
  "short",
  "long",
  "handsome",
  "plain",
  "quaint",
  "clean",
  "elegant",
  "easy",
  "angry",
  "crazy",
  "helpful",
  "mushy",
  "odd",
  "unsightly",
  "adorable",
  "important",
  "inexpensive",
  "cheap",
  "expensive",
  "fancy",
];
const C = [
  "red",
  "yellow",
  "blue",
  "green",
  "pink",
  "brown",
  "purple",
  "brown",
  "white",
  "black",
  "orange",
];
const N = [
  "table",
  "chair",
  "house",
  "bbq",
  "desk",
  "car",
  "pony",
  "cookie",
  "sandwich",
  "burger",
  "pizza",
  "mouse",
  "keyboard",
];
