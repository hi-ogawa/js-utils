import { tinyassert } from "@hiogawa/utils";
import { createRoot } from "react-dom/client";
import { Root } from "./app";

function main() {
  const el = document.getElementById("root");
  tinyassert(el);
  createRoot(el).render(<Root />);
}

main();
