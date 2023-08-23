import initWasmBindGen from "../pkg/index";
import wasmSource from "../pkg/index_bg.wasm"; // let tsup/esbuild bundles binary ~ 20KB

export async function initBundle() {
  const wasmModule = await WebAssembly.compile(wasmSource as any as Uint8Array);
  await initWasmBindGen(wasmModule);
}

// re-export
export { murmur3_32 } from "../pkg/index";
