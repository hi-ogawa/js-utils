import fs from "node:fs";
import path from "node:path";
import process from "node:process";

export async function collectFiles(dir: string) {
  let files: string[] = [];
  await visitFiles(dir, (file, e) => {
    if (!e.isDirectory()) {
      files.push(file);
    }
  });
  // not deterministic on CI without sort?
  return files.sort();
}

async function visitFiles(
  dir: string,
  callback: (filepath: string, e: fs.Dirent) => void
) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const filepath = path.join(e.path, e.name);
    callback(filepath, e);
    if (e.isDirectory()) {
      await visitFiles(filepath, callback);
    }
  }
}

export function useChdir(cwd: string) {
  const cwdBefore = process.cwd();
  process.chdir(cwd);
  return () => {
    process.chdir(cwdBefore);
  };
}
