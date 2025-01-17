import process from "node:process";
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
  if (args.includes("-h") || args.includes("--help")) {
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
  }

  // find release assets
  // https://docs.github.com/en/rest/releases/assets
  const release = await fetchGhApi(
    `https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`
  );
  const assets = release.assets;
  if (!assets || assets.length === 0) {
    console.error(`[ERROR] No assets found for release '${tag}'\n`);
    process.exit(1);
  }

  // prompt which files from asset lists
  // TODO: Implement prompt logic here

  // download a chosen file
  // TODO: Implement download logic here

  // if .zip or .tar.gz, unpack and prompt again which file to use
  // TODO

  // prompt executable name
  // TODO

  // install executable
  // - chmod +x
  // - move it to ~/.local/bin
  //   prompt overwrite if already exists
  // TODO
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
