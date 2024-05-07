/// <reference types="node" />

import fs from "node:fs";
import process from "node:process";
import { defineConfig } from "tsup";

export default [
  defineConfig(() => ({
    entry: ["src/main.ts"],
    format: ["esm", "cjs", "iife"],
    dts: true,
  })),
  defineConfig(() => ({
    entry: ["src/index.ts", "src/vite.ts"],
    format: ["esm", "cjs"],
    dts: true,
    splitting: false,
    define: {
      __DEFINE_MAIN_CODE: JSON.stringify(
        fs.readFileSync("./dist/main.global.js", "utf-8"),
      ),
    },
  })),
][process.env["BUILD_STEP"]!];
