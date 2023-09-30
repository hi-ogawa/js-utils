import "virtual:uno.css";
import { render } from "@hiogawa/tiny-react";
import { tinyassert } from "@hiogawa/utils";

function main() {
  const el = document.getElementById("root");
  tinyassert(el);
  el.innerHTML = "";
  render(<App />, el);
}

function App() {
  return (
    <div class="flex flex-col gap-1">
      <div class="flex p-2">tiny-react test</div>
      <div class="flex flex-col w-full max-w-2xl mx-auto border p-2">
        <h1>Title</h1>
      </div>
    </div>
  );
}

main();
