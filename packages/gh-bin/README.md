# gh-bin

Downlaod and install single file executables from a GitHub release pages. Inspired by https://github.com/marcosnils/bin.

## usage

<!--
%template-input-start:help%

```txt
$ npx gh-bin --help
{%shell node ./bin/cli.js --help %}
```

%template-input-end:help%
-->

<!-- %template-output-start:help% -->

```txt
$ npx gh-bin --help
cpgh@0.0.3-pre.0

Usage:
  npx gh-bin https://github.com/<user>/<repo>/tree/<branch>/<subdir> <outdir>

Options:
  --force      Overwrite <outdir> if it exists
  -h, --help   Show help

Examples:
  npx gh-bin https://github.com/yt-dlp/yt-dlp
  npx gh-bin https://github.com/yt-dlp/yt-dlp/releases/tag/2025.01.15
```

<!-- %template-output-end:help% -->
