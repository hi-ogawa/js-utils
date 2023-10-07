import {
  createHmrComponent,
  createHmrRegistry,
  h,
  setupHmr,
  useEffect,
  useState,
} from "@hiogawa/tiny-react";

// manually use tiny-react hmr runtime for easier testing/debugging

const registry = createHmrRegistry({
  h,
  useState,
  useEffect,
});

export const HmrChild = createHmrComponent(
  registry,
  function HmrChild(props: { counter: number }) {
    const [state, setState] = useState(0);
    const add = 100;
    return (
      <div className="flex flex-col gap-1">
        <h2 className="text-lg">HmrChild</h2>
        <span>
          Parent Counter + {add} = {props.counter + add}
        </span>
        <div className="flex items-center gap-2">
          <span>Child Counter = {state}</span>
          <button
            className="antd-btn antd-btn-default px-1"
            onclick={() => setState((prev) => prev - 1)}
          >
            -1
          </button>
          <button
            className="antd-btn antd-btn-default px-1"
            onclick={() => setState((prev) => prev + 1)}
          >
            +1
          </button>
        </div>
        <span className="text-colorTextSecondary text-sm">
          Changing 'HmrChild' internal (e.g. changing from '+ 100' to '+ 10')
          should preserve the counter state of parent 'TestHmr'. <br />
          However, currently the coutner state of 'HmrChild' itself is not
          preserved and always reset on hot update.
        </span>
      </div>
    );
  },
  { remount: true }
);

if (import.meta.hot) {
  setupHmr(import.meta.hot, registry);

  // source code needs to include exact import.meta expression for vite's static analysis
  () => import.meta.hot?.accept();
}
