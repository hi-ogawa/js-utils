import { memo, useCallback, useState } from "@hiogawa/tiny-react";
import { range } from "@hiogawa/utils";

// benchmark tasks from https://github.com/krausest/js-framework-benchmark
// @hmr-unsafe
export function JsFrameworkBenchmarkApp() {
  const [selected, setSelected] = useState<number | undefined>(undefined);

  const [n, setN] = useState(1000);

  const [items, setItems] = useState(() => generateItems(0));

  const selectItem = useCallback(
    (id: number) => setSelected((prev) => (prev === id ? undefined : id)),
    []
  );

  const deleteItem = useCallback(
    (id: number) => setItems((prev) => prev.filter((other) => other.id !== id)),
    []
  );

  return (
    <div className="border p-2 flex flex-col gap-2">
      <h1 className="text-lg">Benchmark</h1>
      <span className="text-sm text-colorTextSecondary">
        Same benchmark operations as{" "}
        <a
          className="antd-link"
          href="https://github.com/krausest/js-framework-benchmark"
          target="_blank"
        >
          js-framework-benchmark
        </a>
      </span>
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
          <MemoItemCompoment
            key={item.id}
            item={item}
            isSelected={selected === item.id}
            onSelect={selectItem}
            onDelete={deleteItem}
          />
        ))}
      </div>
    </div>
  );
}

// @hmr-disable
function ItemComponent({
  item,
  isSelected,
  onSelect,
  onDelete,
}: {
  item: ItemData;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div
      key={item.id}
      className={cls(
        "flex items-center p-2 px-4 first:border-t-0 border-t hover:bg-colorFillTertiary duration-300",
        isSelected && "!bg-colorFillSecondary"
      )}
    >
      <span className="flex-none text-sm text-colorTextSecondary w-[100px]">
        {item.id}
      </span>
      {/* re-attaching event listener is critical, but having `useCallback` here matters less since `ItemComponent` itself is memoized already */}
      <span className="flex-1 cursor-pointer" onclick={() => onSelect(item.id)}>
        {item.label}
      </span>
      <span
        className="antd-btn antd-btn-ghost i-ri-close-line w-5 h-5"
        onclick={() => onDelete(item.id)}
      />
    </div>
  );
}

// @hmr-disable
const MemoItemCompoment = memo(ItemComponent);

interface ItemData {
  id: number;
  label: string;
}

function cls(...args: unknown[]) {
  return args.filter(Boolean).join(" ");
}

let nextItemId = 1;

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
