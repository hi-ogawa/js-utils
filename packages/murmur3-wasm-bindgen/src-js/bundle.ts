import pkgInit from "../pkg/index";
import pkgWasm from "../pkg/index_bg.wasm"; // let tsup/esbuild bundle wasm binary ~ 20KB

export async function init() {
  const wasmModule = await WebAssembly.compile(pkgWasm as any as Uint8Array);
  await pkgInit(wasmModule);
}

// re-export
export { murmur3_32, murmur3_x64_128, murmur3_x86_128 } from "../pkg/index";
