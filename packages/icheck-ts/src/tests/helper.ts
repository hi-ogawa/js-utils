import fs from "node:fs";
import path from "node:path";

export async function setupTestFixture(
  base: string,
  files: Record<string, string>,
  opts?: { noChdir?: boolean }
) {
  const cwd = `./fixtures/${base}`;
  const cwdBefore = process.cwd();
  await fs.promises.rm(cwd, { recursive: true, force: true });
  await fs.promises.mkdir(cwd);

  for (const [k, v] of Object.entries(files)) {
    await fs.promises.mkdir(path.dirname(path.join(cwd, k)), {
      recursive: true,
    });
    await fs.promises.writeFile(path.join(cwd, k), v);
  }

  if (opts?.noChdir) {
    return () => {};
  }
  process.chdir(cwd);
  return () => {
    process.chdir(cwdBefore);
  };
}
