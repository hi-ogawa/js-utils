import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { Readable } from "node:stream";
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

  // https://github.com/bombshell-dev/clack/tree/main/packages/prompts
  const prompts = await import("@clack/prompts");

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
  // TODO: reorder by matching arch/os/platform
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

  // download a selected asset
  const selectedAssetName =
    assets.find((asset: any) => asset.browser_download_url === selectedAsset)
      ?.name || "asset";
  const downloadSpinner = prompts.spinner();
  downloadSpinner.start(`Downloading ${selectedAssetName}`);
  let tmpAssetPath = path.join(
    os.tmpdir(),
    `gh-bin-asset-${owner}-${repo}${path.extname(selectedAssetName)}`
  );
  try {
    const res = await fetch(selectedAsset);
    if (!res.ok || !res.body) {
      console.error(`[ERROR] Failed to download '${selectedAsset}'\n`);
      process.exit(1);
    }

    const totalSize = parseInt(res.headers.get("content-length") || "0");
    let downloadedSize = 0;

    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      downloadedSize += value.length;

      if (totalSize > 0) {
        const percentage = Math.round((downloadedSize / totalSize) * 100);
        downloadSpinner.message(
          `Downloading ${selectedAssetName} (${percentage}%)`
        );
      } else {
        downloadSpinner.message(
          `Downloading ${selectedAssetName} (${Math.round(downloadedSize / 1024)}KB)`
        );
      }
    }

    const finalBuffer = new Uint8Array(downloadedSize);
    let offset = 0;
    for (const chunk of chunks) {
      finalBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    await fs.promises.writeFile(tmpAssetPath, finalBuffer);
  } finally {
    downloadSpinner.stop(`Downloaded ${selectedAssetName}`);
  }

  let defaultBinName = repo;

  // if .zip or .tar.gz, unpack and prompt again which file to use
  if (selectedAssetName.endsWith(".zip")) {
    // https://github.com/cthackers/adm-zip
    const { default: AdmZip } = await import("adm-zip");
    var zip = new AdmZip(tmpAssetPath);
    var zipEntries = zip.getEntries();
    const selectedEntry = await prompts.select({
      message: "Select an entry to extract from zip",
      options: zipEntries.map((entry) => ({
        label: entry.name,
        value: entry,
      })),
    });
    if (prompts.isCancel(selectedEntry)) {
      return;
    }
    defaultBinName = path.basename(selectedEntry.name);
    let tmpZipEntryPath = path.join(
      os.tmpdir(),
      `gh-bin-asset-${owner}-${repo}-zip-selected-item${path.extname(selectedEntry.name)}`
    );
    fs.promises.writeFile(tmpZipEntryPath, selectedEntry.getData());
    tmpAssetPath = tmpZipEntryPath;
  } else if (
    selectedAsset.endsWith(".tar.gz") ||
    selectedAsset.endsWith(".tar")
  ) {
    // https://github.com/unjs/nanotar
    const nanotar = await import("nanotar");
    const tarData = await fs.promises.readFile(tmpAssetPath);
    const items = selectedAsset.endsWith(".tar.gz")
      ? await nanotar.parseTarGzip(tarData)
      : nanotar.parseTar(tarData);
    const selectedItem = await prompts.select({
      message: "Select a file to extract from tar",
      options: items.map((item) => ({
        label: item.name,
        value: item,
      })),
    });
    if (prompts.isCancel(selectedItem)) {
      return;
    }
    assert(selectedItem.data);
    let tmpZipEntryPath = path.join(
      os.tmpdir(),
      `gh-bin-asset-${owner}-${repo}-tar-selected-item${path.extname(selectedItem.name)}`
    );
    defaultBinName = path.basename(selectedItem.name);
    fs.promises.writeFile(tmpZipEntryPath, selectedItem.data);
    tmpAssetPath = tmpZipEntryPath;
  }

  // prompt an executable name
  const binName = await prompts.text({
    message: "Input a name of executable",
    initialValue: defaultBinName,
  });
  if (prompts.isCancel(binName)) {
    return;
  }

  // install executable
  const destDir = await findExecutablePathDirectory();
  const destPath = path.join(destDir, binName);
  await fs.promises.mkdir(destDir, { recursive: true });
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

// find a directory to install an executable
async function findExecutablePathDirectory() {
  // TODO https://github.com/marcosnils/bin/blob/94bbdcac69f74abb8b3d9e5dcc0fcb22d72d6782/pkg/config/config_unix.go#L17-L19
  return path.join(os.homedir(), ".local", "bin");
}

main();
