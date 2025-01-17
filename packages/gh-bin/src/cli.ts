import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { Readable } from "node:stream";
import * as prompts from "@clack/prompts";
import { name, version } from "../package.json";

const HELP = `\
${name}@${version}

Usage:
  npx gh-bin https://github.com/<owner>/<repo>
  npx gh-bin https://github.com/yt-dlp/yt-dlp
  npx gh-bin https://github.com/yt-dlp/yt-dlp/releases/tag/2025.01.15
`;

const GITHUB_RELEASE_RE = new RegExp(
  String.raw`^https://github.com/([^/]+)/([^/]+)(?:/releases/tag/([^/]+))?$`
);

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("-h") || args.includes("--help") || args.length !== 1) {
    console.log(HELP);
    return;
  }

  // parse github url
  const input = args[0];
  const match = input.replace(/\/+$/, "").match(GITHUB_RELEASE_RE);
  if (!match) {
    console.error(`[ERROR] Invalid input '${input}'\n`);
    process.exit(1);
  }
  let [, owner, repo, tag] = match;

  if (!tag) {
    // find a latest tag
    // https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#get-the-latest-release
    const latestRelease = await fetchGhApi(
      `https://api.github.com/repos/${owner}/${repo}/releases/latest`
    );
    tag = latestRelease.tag_name;
    console.log(`Found the latest release ${tag}`);
  }

  // find release assets
  // https://docs.github.com/en/rest/releases/assets?apiVersion=2022-11-28#list-release-assets
  const release = await fetchGhApi(
    `https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`
  );
  const assets = release.assets;
  if (!assets || assets.length === 0) {
    console.error(`[ERROR] No assets found for release '${tag}'\n`);
    process.exit(1);
  }

  // prompt which files to download from assets
  const selectedAsset = await prompts.select<string>({
    message: "Select an asset to download",
    options: assets.map((asset: any) => ({
      label: asset.name,
      value: asset.browser_download_url,
    })),
  });
  if (prompts.isCancel(selectedAsset)) {
    return;
  }

  // TODO
  // if .zip or .tar.gz, unpack and prompt again which file to use
  if (selectedAsset.endsWith(".zip") || selectedAsset.endsWith(".tar.gz")) {
    console.log("[ERROR] .zip and .tar.gz are unsupported (todo)");
    process.exit(1);
  }

  // download a selected asset
  const downloadSpinner = prompts.spinner();
  downloadSpinner.start(`Downloading ${selectedAsset}`);
  let tmpAssetPath = path.join(
    os.tmpdir(),
    `/gh-bin-asset-${owner}-${repo}.${path.extname(selectedAsset) || "bin"}`
  );
  try {
    const res = await fetch(selectedAsset);
    if (!res.ok || !res.body) {
      console.error(`[ERROR] Failed to download '${selectedAsset}'\n`);
      process.exit(1);
    }
    await fs.promises.writeFile(
      tmpAssetPath,
      Readable.fromWeb(res.body as any)
    );
  } finally {
    downloadSpinner.stop(`Downloaded ${selectedAsset}`);
  }

  // TODO
  // if .zip or .tar.gz, unpack and prompt again which file to use
  if (selectedAsset.endsWith(".zip")) {
  } else if (selectedAsset.endsWith(".tar.gz")) {
  }

  // prompt an executable name
  const binName = await prompts.text({
    message: "Input a name of executable",
    initialValue: repo,
  });
  if (prompts.isCancel(binName)) {
    return;
  }

  // install executable
  const destPath = path.join(os.homedir(), ".local", "bin", binName);
  await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
  await fs.promises.copyFile(tmpAssetPath, destPath);
  await fs.promises.chmod(destPath, 0o755);
  console.log(`Executable is installed in ${destPath}`);
}

async function fetchGhApi(url: string) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) {
    console.error(`[ERROR] Failed to fetch '${url}'\n`);
    process.exit(1);
  }
  return res.json();
}

main();
