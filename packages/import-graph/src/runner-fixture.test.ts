import fastGlob from "fast-glob";
import { describe, expect, it } from "vitest";
import { run } from "./runner";

describe.skip("fixture", () => {
  it("ytsub", async () => {
    const base = "./fixtures/ytsub-v3/app";
    const files = await fastGlob([base + "/**/*.ts", base + "/**/*.tsx"]);
    files.sort(); // glob not deterministic?
    expect(files.length).toMatchInlineSnapshot("158");

    const result = await run(files);
    expect(result.errors).toMatchInlineSnapshot("[]");
    expect(result.entries).toMatchInlineSnapshot(`
      [
        {
          "file": "./fixtures/ytsub-v3/app/components/caption-editor-utils.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "Z_CAPTION_EDITOR_ENTRY_LIST",
                "position": 351,
              },
              {
                "name": "mergePartialTtmlEntries",
                "position": 567,
              },
              {
                "name": "parseManualInput",
                "position": 906,
              },
              {
                "name": "Z_CAPTION_EDITOR_DRAFT_LIST",
                "position": 1138,
              },
              {
                "name": "STORAGE_KEYS",
                "position": 1219,
              },
              {
                "name": "useLocalStorage",
                "position": 1318,
              },
            ],
            "namedImports": [
              {
                "name": "wrapError",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "default",
                "position": 51,
                "source": "react",
              },
              {
                "name": "z",
                "position": 80,
                "source": "zod",
              },
              {
                "name": "zipMax",
                "position": 105,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "TtmlEntry",
                "position": 145,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/components/caption-editor.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "CaptionEditor",
                "position": 1132,
              },
            ],
            "namedImports": [
              {
                "name": "Transition",
                "position": 9,
                "source": "@headlessui/react",
              },
              {
                "name": "mapOption",
                "position": 57,
                "source": "@hiogawa/utils",
              },
              {
                "name": "range",
                "position": 68,
                "source": "@hiogawa/utils",
              },
              {
                "name": "tinyassert",
                "position": 75,
                "source": "@hiogawa/utils",
              },
              {
                "name": "toArraySetState",
                "position": 120,
                "source": "@hiogawa/utils-react",
              },
              {
                "name": "useRafLoop",
                "position": 137,
                "source": "@hiogawa/utils-react",
              },
              {
                "name": "useMutation",
                "position": 188,
                "source": "@tanstack/react-query",
              },
              {
                "name": "default",
                "position": 239,
                "source": "react",
              },
              {
                "name": "useForm",
                "position": 268,
                "source": "react-hook-form",
              },
              {
                "name": "toast",
                "position": 311,
                "source": "react-hot-toast",
              },
              {
                "name": "z",
                "position": 352,
                "source": "zod",
              },
              {
                "name": "rpcClient",
                "position": 377,
                "source": "fixtures/ytsub-v3/app/trpc/client",
              },
              {
                "name": "useDocumentEvent",
                "position": 421,
                "source": "fixtures/ytsub-v3/app/utils/hooks-client-utils",
              },
              {
                "name": "cls",
                "position": 485,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "zipMax",
                "position": 490,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "CaptionEntry",
                "position": 535,
                "source": "fixtures/ytsub-v3/app/utils/types",
              },
              {
                "name": "VideoMetadata",
                "position": 549,
                "source": "fixtures/ytsub-v3/app/utils/types",
              },
              {
                "name": "YoutubePlayer",
                "position": 599,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "mergeTtmlEntries",
                "position": 616,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "stringifyTimestamp",
                "position": 636,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "toCaptionConfigOptions",
                "position": 658,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "usePlayerLoader",
                "position": 684,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "CaptionEditorEntry",
                "position": 739,
                "source": "fixtures/ytsub-v3/app/components/caption-editor-utils",
              },
              {
                "name": "CaptionEditorEntrySimple",
                "position": 761,
                "source": "fixtures/ytsub-v3/app/components/caption-editor-utils",
              },
              {
                "name": "mergePartialTtmlEntries",
                "position": 789,
                "source": "fixtures/ytsub-v3/app/components/caption-editor-utils",
              },
              {
                "name": "parseManualInput",
                "position": 816,
                "source": "fixtures/ytsub-v3/app/components/caption-editor-utils",
              },
              {
                "name": "SelectWrapper",
                "position": 876,
                "source": "fixtures/ytsub-v3/app/components/misc",
              },
              {
                "name": "transitionProps",
                "position": 891,
                "source": "fixtures/ytsub-v3/app/components/misc",
              },
              {
                "name": "useModal",
                "position": 933,
                "source": "fixtures/ytsub-v3/app/components/modal",
              },
              {
                "name": "PopoverSimple",
                "position": 969,
                "source": "fixtures/ytsub-v3/app/components/popover",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/components/collapse.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "CollapseTransition",
                "position": 362,
              },
            ],
            "namedImports": [
              {
                "name": "Transition",
                "position": 9,
                "source": "@headlessui/react",
              },
              {
                "name": "tinyassert",
                "position": 57,
                "source": "@hiogawa/utils",
              },
              {
                "name": "default",
                "position": 100,
                "source": "react",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/components/drawer.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "Drawer",
                "position": 309,
              },
            ],
            "namedImports": [
              {
                "name": "useDismiss",
                "position": 9,
                "source": "@floating-ui/react",
              },
              {
                "name": "useFloating",
                "position": 21,
                "source": "@floating-ui/react",
              },
              {
                "name": "useInteractions",
                "position": 34,
                "source": "@floating-ui/react",
              },
              {
                "name": "Transition",
                "position": 88,
                "source": "@headlessui/react",
              },
              {
                "name": "tinyassert",
                "position": 136,
                "source": "@hiogawa/utils",
              },
              {
                "name": "default",
                "position": 179,
                "source": "react",
              },
              {
                "name": "RemoveScroll",
                "position": 213,
                "source": "react-remove-scroll",
              },
              {
                "name": "FloatingWrapper",
                "position": 265,
                "source": "fixtures/ytsub-v3/app/components/floating-utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/components/floating-utils.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "FloatingWrapper",
                "position": 155,
              },
            ],
            "namedImports": [
              {
                "name": "FloatingNode",
                "position": 11,
                "source": "@floating-ui/react",
              },
              {
                "name": "FloatingPortal",
                "position": 27,
                "source": "@floating-ui/react",
              },
              {
                "name": "useFloating",
                "position": 45,
                "source": "@floating-ui/react",
              },
              {
                "name": "useFloatingNodeId",
                "position": 60,
                "source": "@floating-ui/react",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/components/misc.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "VideoComponent",
                "position": 515,
              },
              {
                "name": "transitionProps",
                "position": 3752,
              },
              {
                "name": "PaginationComponent",
                "position": 3907,
              },
              {
                "name": "SelectWrapper",
                "position": 5652,
              },
            ],
            "namedImports": [
              {
                "name": "FloatingContext",
                "position": 14,
                "source": "@floating-ui/react",
              },
              {
                "name": "Transition",
                "position": 68,
                "source": "@headlessui/react",
              },
              {
                "name": "Link",
                "position": 116,
                "source": "@remix-run/react",
              },
              {
                "name": "VideoTable",
                "position": 162,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "$R",
                "position": 205,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "Z_PAGINATION_QUERY",
                "position": 209,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "useTypedUrlQuery",
                "position": 262,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "cls",
                "position": 320,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "PaginationMetadata",
                "position": 362,
                "source": "fixtures/ytsub-v3/app/utils/pagination",
              },
              {
                "name": "parseVssId",
                "position": 420,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "toThumbnail",
                "position": 432,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "PopoverSimple",
                "position": 480,
                "source": "fixtures/ytsub-v3/app/components/popover",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/components/modal.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "useModal",
                "position": 2275,
              },
            ],
            "namedImports": [
              {
                "name": "useDismiss",
                "position": 9,
                "source": "@floating-ui/react",
              },
              {
                "name": "useFloating",
                "position": 21,
                "source": "@floating-ui/react",
              },
              {
                "name": "useInteractions",
                "position": 34,
                "source": "@floating-ui/react",
              },
              {
                "name": "Transition",
                "position": 88,
                "source": "@headlessui/react",
              },
              {
                "name": "tinyassert",
                "position": 136,
                "source": "@hiogawa/utils",
              },
              {
                "name": "atom",
                "position": 181,
                "source": "jotai",
              },
              {
                "name": "useAtom",
                "position": 187,
                "source": "jotai",
              },
              {
                "name": "default",
                "position": 218,
                "source": "react",
              },
              {
                "name": "RemoveScroll",
                "position": 247,
                "source": "react-remove-scroll",
              },
              {
                "name": "cls",
                "position": 299,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "FloatingWrapper",
                "position": 336,
                "source": "fixtures/ytsub-v3/app/components/floating-utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/components/popover.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "PopoverSimple",
                "position": 2245,
              },
            ],
            "namedImports": [
              {
                "name": "FloatingContext",
                "position": 11,
                "source": "@floating-ui/react",
              },
              {
                "name": "Placement",
                "position": 30,
                "source": "@floating-ui/react",
              },
              {
                "name": "arrow",
                "position": 43,
                "source": "@floating-ui/react",
              },
              {
                "name": "autoUpdate",
                "position": 52,
                "source": "@floating-ui/react",
              },
              {
                "name": "flip",
                "position": 66,
                "source": "@floating-ui/react",
              },
              {
                "name": "offset",
                "position": 74,
                "source": "@floating-ui/react",
              },
              {
                "name": "shift",
                "position": 84,
                "source": "@floating-ui/react",
              },
              {
                "name": "useClick",
                "position": 93,
                "source": "@floating-ui/react",
              },
              {
                "name": "useDismiss",
                "position": 105,
                "source": "@floating-ui/react",
              },
              {
                "name": "useFloating",
                "position": 119,
                "source": "@floating-ui/react",
              },
              {
                "name": "useInteractions",
                "position": 134,
                "source": "@floating-ui/react",
              },
              {
                "name": "Transition",
                "position": 189,
                "source": "@headlessui/react",
              },
              {
                "name": "default",
                "position": 235,
                "source": "react",
              },
              {
                "name": "cls",
                "position": 264,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "FloatingWrapper",
                "position": 301,
                "source": "fixtures/ytsub-v3/app/components/floating-utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/components/practice-history-chart.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "PRACTICE_HISTORY_DATASET_KEYS",
                "position": 300,
              },
              {
                "name": "practiceHistoryChartDataToEchartsOption",
                "position": 616,
              },
              {
                "name": "createBookmarkHistoryChartOption",
                "position": 2920,
              },
              {
                "name": "EchartsComponent",
                "position": 4255,
              },
            ],
            "namedImports": [
              {
                "name": "tinyassert",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "useStableRef",
                "position": 54,
                "source": "@hiogawa/utils-react",
              },
              {
                "name": "Temporal",
                "position": 107,
                "source": "@js-temporal/polyfill",
              },
              {
                "name": "default",
                "position": 191,
                "source": "react",
              },
              {
                "name": "PRACTICE_ACTION_TYPES",
                "position": 220,
                "source": "fixtures/ytsub-v3/app/db/types",
              },
              {
                "name": "PRACTICE_QUEUE_TYPES",
                "position": 243,
                "source": "fixtures/ytsub-v3/app/db/types",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [
              {
                "position": 155,
                "source": "echarts",
              },
            ],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/components/stories.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "TestMenu",
                "position": 710,
              },
              {
                "name": "TestPagination",
                "position": 1421,
              },
              {
                "name": "TestPopover",
                "position": 2504,
              },
              {
                "name": "TestVideoComponent",
                "position": 3843,
              },
              {
                "name": "TestFab",
                "position": 6003,
              },
              {
                "name": "TestSpinner",
                "position": 7326,
              },
              {
                "name": "TestPracticeHistoryChart",
                "position": 8899,
              },
              {
                "name": "TestYoutubePlayer",
                "position": 9921,
              },
              {
                "name": "TestCaptionEditor",
                "position": 11387,
              },
            ],
            "namedImports": [
              {
                "name": "Transition",
                "position": 9,
                "source": "@headlessui/react",
              },
              {
                "name": "useRafLoop",
                "position": 57,
                "source": "@hiogawa/utils-react",
              },
              {
                "name": "default",
                "position": 106,
                "source": "react",
              },
              {
                "name": "useForm",
                "position": 135,
                "source": "react-hook-form",
              },
              {
                "name": "cls",
                "position": 178,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "DUMMY_VIDEO_METADATA",
                "position": 215,
                "source": "fixtures/ytsub-v3/app/utils/types",
              },
              {
                "name": "YoutubePlayer",
                "position": 270,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "usePlayerLoader",
                "position": 285,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "CaptionEditor",
                "position": 337,
                "source": "fixtures/ytsub-v3/app/components/caption-editor",
              },
              {
                "name": "STORAGE_KEYS",
                "position": 389,
                "source": "fixtures/ytsub-v3/app/components/caption-editor-utils",
              },
              {
                "name": "Z_CAPTION_EDITOR_ENTRY_LIST",
                "position": 405,
                "source": "fixtures/ytsub-v3/app/components/caption-editor-utils",
              },
              {
                "name": "useLocalStorage",
                "position": 436,
                "source": "fixtures/ytsub-v3/app/components/caption-editor-utils",
              },
              {
                "name": "SelectWrapper",
                "position": 495,
                "source": "fixtures/ytsub-v3/app/components/misc",
              },
              {
                "name": "VideoComponent",
                "position": 510,
                "source": "fixtures/ytsub-v3/app/components/misc",
              },
              {
                "name": "transitionProps",
                "position": 526,
                "source": "fixtures/ytsub-v3/app/components/misc",
              },
              {
                "name": "PopoverSimple",
                "position": 568,
                "source": "fixtures/ytsub-v3/app/components/popover",
              },
              {
                "name": "EchartsComponent",
                "position": 613,
                "source": "fixtures/ytsub-v3/app/components/practice-history-chart",
              },
              {
                "name": "practiceHistoryChartDataToEchartsOption",
                "position": 633,
                "source": "fixtures/ytsub-v3/app/components/practice-history-chart",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/components/theme-select.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "ThemeSelect",
                "position": 246,
              },
            ],
            "namedImports": [
              {
                "name": "getTheme",
                "position": 9,
                "source": "@hiogawa/theme-script",
              },
              {
                "name": "setTheme",
                "position": 19,
                "source": "@hiogawa/theme-script",
              },
              {
                "name": "capitalize",
                "position": 69,
                "source": "@hiogawa/utils",
              },
              {
                "name": "default",
                "position": 112,
                "source": "react",
              },
              {
                "name": "SelectWrapper",
                "position": 141,
                "source": "fixtures/ytsub-v3/app/components/misc",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/components/top-progress-bar.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "TopProgressBarRemix",
                "position": 432,
              },
            ],
            "namedImports": [
              {
                "name": "default",
                "position": 7,
                "source": "@badrap/bar-of-progress",
              },
              {
                "name": "useNavigation",
                "position": 62,
                "source": "@remix-run/react",
              },
              {
                "name": "default",
                "position": 110,
                "source": "react",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/db/__migration-stub.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "up",
                "position": 35,
              },
              {
                "name": "down",
                "position": 111,
              },
            ],
            "namedImports": [
              {
                "name": "Knex",
                "position": 14,
                "source": "knex",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/db/drizzle-client.server.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "T",
                "position": 5805,
              },
              {
                "name": "E",
                "position": 6247,
              },
              {
                "name": "limitOne",
                "position": 6253,
              },
              {
                "name": "selectMany",
                "position": 6451,
              },
              {
                "name": "selectOne",
                "position": 6641,
              },
              {
                "name": "toPaginationResult",
                "position": 6854,
              },
              {
                "name": "toCountSql",
                "position": 7636,
              },
              {
                "name": "toDeleteSqlInner",
                "position": 8050,
              },
              {
                "name": "toDeleteSql",
                "position": 8524,
              },
              {
                "name": "dbRaw",
                "position": 8772,
              },
              {
                "name": "dbShowTables",
                "position": 8867,
              },
              {
                "name": "dbGetSchema",
                "position": 9087,
              },
              {
                "name": "dbGetMigrationStatus",
                "position": 9662,
              },
              {
                "name": "db",
                "position": 10356,
              },
              {
                "name": "initializeDrizzleClient",
                "position": 10414,
              },
              {
                "name": "finalizeDrizzleClient",
                "position": 10788,
              },
              {
                "name": "__dbExtra",
                "position": 10875,
              },
            ],
            "namedImports": [
              {
                "name": "difference",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "tinyassert",
                "position": 21,
                "source": "@hiogawa/utils",
              },
              {
                "name": "InferModel",
                "position": 66,
                "source": "drizzle-orm",
              },
              {
                "name": "SQL",
                "position": 78,
                "source": "drizzle-orm",
              },
              {
                "name": "StringChunk",
                "position": 83,
                "source": "drizzle-orm",
              },
              {
                "name": "sql",
                "position": 96,
                "source": "drizzle-orm",
              },
              {
                "name": "MySqlDialect",
                "position": 133,
                "source": "drizzle-orm/mysql-core",
              },
              {
                "name": "boolean",
                "position": 149,
                "source": "drizzle-orm/mysql-core",
              },
              {
                "name": "customType",
                "position": 160,
                "source": "drizzle-orm/mysql-core",
              },
              {
                "name": "float",
                "position": 174,
                "source": "drizzle-orm/mysql-core",
              },
              {
                "name": "int",
                "position": 183,
                "source": "drizzle-orm/mysql-core",
              },
              {
                "name": "json",
                "position": 190,
                "source": "drizzle-orm/mysql-core",
              },
              {
                "name": "mysqlTable",
                "position": 198,
                "source": "drizzle-orm/mysql-core",
              },
              {
                "name": "serial",
                "position": 212,
                "source": "drizzle-orm/mysql-core",
              },
              {
                "name": "text",
                "position": 222,
                "source": "drizzle-orm/mysql-core",
              },
              {
                "name": "timestamp",
                "position": 230,
                "source": "drizzle-orm/mysql-core",
              },
              {
                "name": "MySql2Database",
                "position": 283,
                "source": "drizzle-orm/mysql2",
              },
              {
                "name": "drizzle",
                "position": 299,
                "source": "drizzle-orm/mysql2",
              },
              {
                "name": "Connection",
                "position": 350,
                "source": "mysql2",
              },
              {
                "name": "createConnection",
                "position": 387,
                "source": "mysql2/promise",
              },
              {
                "name": "uninitialized",
                "position": 438,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "PaginationMetadata",
                "position": 490,
                "source": "fixtures/ytsub-v3/app/utils/pagination",
              },
              {
                "name": "PaginationParams",
                "position": 510,
                "source": "fixtures/ytsub-v3/app/utils/pagination",
              },
              {
                "name": "default",
                "position": 564,
                "source": "fixtures/ytsub-v3/app/db/knexfile.server",
              },
              {
                "name": "DeckCache",
                "position": 613,
                "source": "fixtures/ytsub-v3/app/db/types",
              },
              {
                "name": "PracticeActionType",
                "position": 624,
                "source": "fixtures/ytsub-v3/app/db/types",
              },
              {
                "name": "PracticeQueueType",
                "position": 644,
                "source": "fixtures/ytsub-v3/app/db/types",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [
              {
                "position": 6201,
                "source": "fixtures/ytsub-v3/app/db/drizzle-expressions",
              },
            ],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/db/drizzle-client.test.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [
              {
                "name": "sql",
                "position": 9,
                "source": "drizzle-orm",
              },
              {
                "name": "describe",
                "position": 44,
                "source": "vitest",
              },
              {
                "name": "expect",
                "position": 54,
                "source": "vitest",
              },
              {
                "name": "it",
                "position": 62,
                "source": "vitest",
              },
              {
                "name": "E",
                "position": 93,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "T",
                "position": 98,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "TT",
                "position": 103,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "__dbExtra",
                "position": 109,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "db",
                "position": 122,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "dbShowTables",
                "position": 128,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "selectMany",
                "position": 144,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "selectOne",
                "position": 158,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "toCountSql",
                "position": 171,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "toDeleteSql",
                "position": 185,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "toDeleteSqlInner",
                "position": 200,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "deleteOrphans",
                "position": 261,
                "source": "fixtures/ytsub-v3/app/db/helper",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/db/drizzle-expressions.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [],
            "namedReExports": [
              {
                "name": "asc",
                "nameBefore": undefined,
                "position": 308,
                "source": "drizzle-orm",
              },
              {
                "name": "desc",
                "nameBefore": undefined,
                "position": 315,
                "source": "drizzle-orm",
              },
              {
                "name": "eq",
                "nameBefore": undefined,
                "position": 492,
                "source": "drizzle-orm",
              },
              {
                "name": "ne",
                "nameBefore": undefined,
                "position": 498,
                "source": "drizzle-orm",
              },
              {
                "name": "gt",
                "nameBefore": undefined,
                "position": 504,
                "source": "drizzle-orm",
              },
              {
                "name": "gte",
                "nameBefore": undefined,
                "position": 510,
                "source": "drizzle-orm",
              },
              {
                "name": "lt",
                "nameBefore": undefined,
                "position": 517,
                "source": "drizzle-orm",
              },
              {
                "name": "lte",
                "nameBefore": undefined,
                "position": 523,
                "source": "drizzle-orm",
              },
              {
                "name": "isNull",
                "nameBefore": undefined,
                "position": 530,
                "source": "drizzle-orm",
              },
              {
                "name": "isNotNull",
                "nameBefore": undefined,
                "position": 540,
                "source": "drizzle-orm",
              },
              {
                "name": "inArray",
                "nameBefore": undefined,
                "position": 553,
                "source": "drizzle-orm",
              },
              {
                "name": "notInArray",
                "nameBefore": undefined,
                "position": 564,
                "source": "drizzle-orm",
              },
              {
                "name": "exists",
                "nameBefore": undefined,
                "position": 578,
                "source": "drizzle-orm",
              },
              {
                "name": "notExists",
                "nameBefore": undefined,
                "position": 588,
                "source": "drizzle-orm",
              },
              {
                "name": "between",
                "nameBefore": undefined,
                "position": 601,
                "source": "drizzle-orm",
              },
              {
                "name": "notBetween",
                "nameBefore": undefined,
                "position": 612,
                "source": "drizzle-orm",
              },
              {
                "name": "like",
                "nameBefore": undefined,
                "position": 626,
                "source": "drizzle-orm",
              },
              {
                "name": "ilike",
                "nameBefore": undefined,
                "position": 634,
                "source": "drizzle-orm",
              },
              {
                "name": "notIlike",
                "nameBefore": undefined,
                "position": 643,
                "source": "drizzle-orm",
              },
              {
                "name": "not",
                "nameBefore": undefined,
                "position": 655,
                "source": "drizzle-orm",
              },
              {
                "name": "and",
                "nameBefore": undefined,
                "position": 662,
                "source": "drizzle-orm",
              },
              {
                "name": "or",
                "nameBefore": undefined,
                "position": 669,
                "source": "drizzle-orm",
              },
            ],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/db/helper.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "truncateAll",
                "position": 198,
              },
              {
                "name": "deleteOrphans",
                "position": 532,
              },
              {
                "name": "filterNewVideo",
                "position": 2124,
              },
              {
                "name": "insertVideoAndCaptionEntries",
                "position": 2844,
              },
              {
                "name": "getVideoAndCaptionEntries",
                "position": 3736,
              },
            ],
            "namedImports": [
              {
                "name": "CaptionEntry",
                "position": 14,
                "source": "fixtures/ytsub-v3/app/utils/types",
              },
              {
                "name": "VideoMetadata",
                "position": 28,
                "source": "fixtures/ytsub-v3/app/utils/types",
              },
              {
                "name": "NewVideo",
                "position": 81,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "E",
                "position": 126,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "T",
                "position": 129,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "TT",
                "position": 132,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "db",
                "position": 136,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "selectOne",
                "position": 140,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "toDeleteSql",
                "position": 151,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/db/knexfile.server.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "default",
                "position": 137,
              },
            ],
            "namedImports": [
              {
                "name": "default",
                "position": 7,
                "source": "node:path",
              },
              {
                "name": "Knex",
                "position": 44,
                "source": "knex",
              },
              {
                "name": "initializeConfigServer",
                "position": 73,
                "source": "fixtures/ytsub-v3/app/utils/config",
              },
              {
                "name": "serverConfig",
                "position": 97,
                "source": "fixtures/ytsub-v3/app/utils/config",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/db/migrations/20230417034357_captionEntries-index-videoId-index.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "up",
                "position": 35,
              },
              {
                "name": "down",
                "position": 195,
              },
            ],
            "namedImports": [
              {
                "name": "Knex",
                "position": 14,
                "source": "knex",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/db/migrations/20230422054538_drop-captionEntries_videoId_key.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "up",
                "position": 35,
              },
              {
                "name": "down",
                "position": 174,
              },
            ],
            "namedImports": [
              {
                "name": "Knex",
                "position": 14,
                "source": "knex",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/db/migrations/20230422063146_add-decks-cache.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "up",
                "position": 35,
              },
              {
                "name": "down",
                "position": 278,
              },
            ],
            "namedImports": [
              {
                "name": "Knex",
                "position": 14,
                "source": "knex",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/db/migrations/20230423124137_tweak-index.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "up",
                "position": 35,
              },
              {
                "name": "down",
                "position": 461,
              },
            ],
            "namedImports": [
              {
                "name": "Knex",
                "position": 14,
                "source": "knex",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/db/migrations/20230501041818_bookmarkEntries_userId_createdAt_key.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "up",
                "position": 35,
              },
              {
                "name": "down",
                "position": 245,
              },
            ],
            "namedImports": [
              {
                "name": "Knex",
                "position": 14,
                "source": "knex",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/db/migrations/20230527023906_add-user-email.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "up",
                "position": 61,
              },
              {
                "name": "down",
                "position": 241,
              },
            ],
            "namedImports": [
              {
                "name": "default",
                "position": 7,
                "source": "node:fs",
              },
              {
                "name": "Knex",
                "position": 40,
                "source": "knex",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/db/models.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [
              {
                "name": "TT",
                "position": 14,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/db/types.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "Z_PRACTICE_ACTION_TYPES",
                "position": 209,
              },
              {
                "name": "Z_PRACTICE_QUEUE_TYPES",
                "position": 302,
              },
              {
                "name": "PRACTICE_ACTION_TYPES",
                "position": 377,
              },
              {
                "name": "PRACTICE_QUEUE_TYPES",
                "position": 447,
              },
              {
                "name": "DEFAULT_DECK_CACHE",
                "position": 872,
              },
            ],
            "namedImports": [
              {
                "name": "z",
                "position": 9,
                "source": "zod",
              },
              {
                "name": "defaultObject",
                "position": 34,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/e2e/auth.test.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [
              {
                "name": "hashString",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "tinyassert",
                "position": 21,
                "source": "@hiogawa/utils",
              },
              {
                "name": "Page",
                "position": 66,
                "source": "@playwright/test",
              },
              {
                "name": "expect",
                "position": 72,
                "source": "@playwright/test",
              },
              {
                "name": "E",
                "position": 115,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "T",
                "position": 118,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "db",
                "position": 121,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "Email",
                "position": 176,
                "source": "fixtures/ytsub-v3/app/utils/email-utils",
              },
              {
                "name": "test",
                "position": 222,
                "source": "fixtures/ytsub-v3/app/e2e/coverage",
              },
              {
                "name": "useUserE2E",
                "position": 257,
                "source": "fixtures/ytsub-v3/app/e2e/helper",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/e2e/basic.test.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [
              {
                "name": "expect",
                "position": 9,
                "source": "@playwright/test",
              },
              {
                "name": "test",
                "position": 52,
                "source": "fixtures/ytsub-v3/app/e2e/coverage",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/e2e/bookmarks.test.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [
              {
                "name": "importSeed",
                "position": 9,
                "source": "fixtures/ytsub-v3/app/misc/seed-utils",
              },
              {
                "name": "test",
                "position": 58,
                "source": "fixtures/ytsub-v3/app/e2e/coverage",
              },
              {
                "name": "useUserE2E",
                "position": 93,
                "source": "fixtures/ytsub-v3/app/e2e/helper",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/e2e/coverage.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "test",
                "position": 312,
              },
            ],
            "namedImports": [
              {
                "name": "default",
                "position": 7,
                "source": "node:fs/promises",
              },
              {
                "name": "default",
                "position": 42,
                "source": "node:path",
              },
              {
                "name": "hashString",
                "position": 74,
                "source": "@hiogawa/utils",
              },
              {
                "name": "Page",
                "position": 119,
                "source": "@playwright/test",
              },
              {
                "name": "test",
                "position": 125,
                "source": "@playwright/test",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/e2e/decks.test.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [
              {
                "name": "expect",
                "position": 9,
                "source": "@playwright/test",
              },
              {
                "name": "DEFAULT_SEED_FILE",
                "position": 52,
                "source": "fixtures/ytsub-v3/app/misc/seed-utils",
              },
              {
                "name": "importSeed",
                "position": 71,
                "source": "fixtures/ytsub-v3/app/misc/seed-utils",
              },
              {
                "name": "test",
                "position": 120,
                "source": "fixtures/ytsub-v3/app/e2e/coverage",
              },
              {
                "name": "useUserE2E",
                "position": 155,
                "source": "fixtures/ytsub-v3/app/e2e/helper",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/e2e/helper.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "useUserE2E",
                "position": 571,
              },
            ],
            "namedImports": [
              {
                "name": "newPromiseWithResolvers",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "Page",
                "position": 67,
                "source": "@playwright/test",
              },
              {
                "name": "test",
                "position": 73,
                "source": "@playwright/test",
              },
              {
                "name": "UserTable",
                "position": 119,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "useUserImpl",
                "position": 161,
                "source": "fixtures/ytsub-v3/app/misc/test-helper-common",
              },
              {
                "name": "testSetupCommon",
                "position": 219,
                "source": "fixtures/ytsub-v3/app/misc/test-setup-common",
              },
              {
                "name": "writeCookieSession",
                "position": 280,
                "source": "fixtures/ytsub-v3/app/server/request-context/session",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/e2e/videos.test.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [
              {
                "name": "regExpRaw",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "expect",
                "position": 53,
                "source": "@playwright/test",
              },
              {
                "name": "E",
                "position": 96,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "T",
                "position": 99,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "db",
                "position": 102,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "importSeed",
                "position": 152,
                "source": "fixtures/ytsub-v3/app/misc/seed-utils",
              },
              {
                "name": "test",
                "position": 201,
                "source": "fixtures/ytsub-v3/app/e2e/coverage",
              },
              {
                "name": "useUserE2E",
                "position": 236,
                "source": "fixtures/ytsub-v3/app/e2e/helper",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/entry-ui-dev.tsx",
          "parseOutput": {
            "bareImports": [
              {
                "position": 0,
                "source": "virtual:uno.css",
              },
            ],
            "namedExports": [],
            "namedImports": [
              {
                "name": "tinyassert",
                "position": 35,
                "source": "@hiogawa/utils",
              },
              {
                "name": "Compose",
                "position": 80,
                "source": "@hiogawa/utils-react",
              },
              {
                "name": "createRoot",
                "position": 128,
                "source": "react-dom/client",
              },
              {
                "name": "NavLink",
                "position": 177,
                "source": "react-router-dom",
              },
              {
                "name": "Outlet",
                "position": 188,
                "source": "react-router-dom",
              },
              {
                "name": "RouteObject",
                "position": 198,
                "source": "react-router-dom",
              },
              {
                "name": "RouterProvider",
                "position": 213,
                "source": "react-router-dom",
              },
              {
                "name": "createHashRouter",
                "position": 231,
                "source": "react-router-dom",
              },
              {
                "name": "redirect",
                "position": 251,
                "source": "react-router-dom",
              },
              {
                "name": "ThemeSelect",
                "position": 346,
                "source": "fixtures/ytsub-v3/app/components/theme-select",
              },
              {
                "name": "cls",
                "position": 403,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "QueryClientWrapper",
                "position": 439,
                "source": "fixtures/ytsub-v3/app/utils/react-query-utils",
              },
              {
                "name": "ToastWrapper",
                "position": 503,
                "source": "fixtures/ytsub-v3/app/utils/toast-utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [
              {
                "position": 295,
                "source": "fixtures/ytsub-v3/app/components/stories",
              },
            ],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/entry.client.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [
              {
                "name": "tinyassert",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "RemixBrowser",
                "position": 54,
                "source": "@remix-run/react",
              },
              {
                "name": "hydrateRoot",
                "position": 103,
                "source": "react-dom/client",
              },
              {
                "name": "registerServiceWorker",
                "position": 151,
                "source": "fixtures/ytsub-v3/app/misc/register-service-worker.client",
              },
              {
                "name": "initializePublicConfigClient",
                "position": 230,
                "source": "fixtures/ytsub-v3/app/utils/config-public",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/entry.server.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "default",
                "position": 772,
              },
            ],
            "namedImports": [
              {
                "name": "RemixServer",
                "position": 9,
                "source": "@remix-run/react",
              },
              {
                "name": "HandleDocumentRequestFunction",
                "position": 62,
                "source": "@remix-run/server-runtime",
              },
              {
                "name": "renderToString",
                "position": 137,
                "source": "react-dom/server",
              },
              {
                "name": "renderToDocument",
                "position": 188,
                "source": "fixtures/ytsub-v3/app/server/document",
              },
              {
                "name": "wrapTraceAsyncSimple",
                "position": 242,
                "source": "fixtures/ytsub-v3/app/utils/opentelemetry-utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/misc/cli.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [
              {
                "name": "deepEqual",
                "position": 9,
                "source": "assert/strict",
              },
              {
                "name": "default",
                "position": 50,
                "source": "node:fs",
              },
              {
                "name": "TinyCli",
                "position": 78,
                "source": "@hiogawa/tiny-cli",
              },
              {
                "name": "TinyCliParseError",
                "position": 87,
                "source": "@hiogawa/tiny-cli",
              },
              {
                "name": "arg",
                "position": 106,
                "source": "@hiogawa/tiny-cli",
              },
              {
                "name": "zArg",
                "position": 111,
                "source": "@hiogawa/tiny-cli",
              },
              {
                "name": "groupBy",
                "position": 153,
                "source": "@hiogawa/utils",
              },
              {
                "name": "objectPick",
                "position": 162,
                "source": "@hiogawa/utils",
              },
              {
                "name": "range",
                "position": 174,
                "source": "@hiogawa/utils",
              },
              {
                "name": "tinyassert",
                "position": 181,
                "source": "@hiogawa/utils",
              },
              {
                "name": "zip",
                "position": 193,
                "source": "@hiogawa/utils",
              },
              {
                "name": "default",
                "position": 229,
                "source": "consola",
              },
              {
                "name": "sql",
                "position": 262,
                "source": "drizzle-orm",
              },
              {
                "name": "z",
                "position": 297,
                "source": "zod",
              },
              {
                "name": "E",
                "position": 324,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "T",
                "position": 329,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "db",
                "position": 334,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "dbGetMigrationStatus",
                "position": 340,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "dbGetSchema",
                "position": 364,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "selectOne",
                "position": 379,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "deleteOrphans",
                "position": 439,
                "source": "fixtures/ytsub-v3/app/db/helper",
              },
              {
                "name": "filterNewVideo",
                "position": 456,
                "source": "fixtures/ytsub-v3/app/db/helper",
              },
              {
                "name": "insertVideoAndCaptionEntries",
                "position": 474,
                "source": "fixtures/ytsub-v3/app/db/helper",
              },
              {
                "name": "writeCookieSession",
                "position": 536,
                "source": "fixtures/ytsub-v3/app/server/request-context/session",
              },
              {
                "name": "findByUsername",
                "position": 608,
                "source": "fixtures/ytsub-v3/app/utils/auth",
              },
              {
                "name": "register",
                "position": 624,
                "source": "fixtures/ytsub-v3/app/utils/auth",
              },
              {
                "name": "exec",
                "position": 666,
                "source": "fixtures/ytsub-v3/app/utils/node.server",
              },
              {
                "name": "streamToString",
                "position": 672,
                "source": "fixtures/ytsub-v3/app/utils/node.server",
              },
              {
                "name": "toPasswordHash",
                "position": 727,
                "source": "fixtures/ytsub-v3/app/utils/password-utils",
              },
              {
                "name": "queryNextPracticeEntryRandomModeBatch",
                "position": 787,
                "source": "fixtures/ytsub-v3/app/utils/practice-system",
              },
              {
                "name": "resetDeckCache",
                "position": 828,
                "source": "fixtures/ytsub-v3/app/utils/practice-system",
              },
              {
                "name": "Z_VIDEO_METADATA",
                "position": 888,
                "source": "fixtures/ytsub-v3/app/utils/types",
              },
              {
                "name": "NewVideo",
                "position": 941,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "captionConfigToUrl",
                "position": 953,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "fetchCaptionEntries",
                "position": 975,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "fetchVideoMetadataRaw",
                "position": 998,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "toCaptionConfigOptions",
                "position": 1023,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "finalizeServer",
                "position": 1083,
                "source": "fixtures/ytsub-v3/app/misc/initialize-server",
              },
              {
                "name": "initializeServer",
                "position": 1099,
                "source": "fixtures/ytsub-v3/app/misc/initialize-server",
              },
              {
                "name": "exportDeckJson",
                "position": 1155,
                "source": "fixtures/ytsub-v3/app/misc/seed-utils",
              },
              {
                "name": "importDeckJson",
                "position": 1171,
                "source": "fixtures/ytsub-v3/app/misc/seed-utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/misc/console.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [
              {
                "name": "sql",
                "position": 9,
                "source": "drizzle-orm",
              },
              {
                "name": "E",
                "position": 44,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "T",
                "position": 47,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "db",
                "position": 50,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "dbRaw",
                "position": 54,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "initializeServer",
                "position": 107,
                "source": "fixtures/ytsub-v3/app/misc/initialize-server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/misc/entry-express.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "default",
                "position": 325,
              },
            ],
            "namedImports": [
              {
                "name": "createMiddleware",
                "position": 9,
                "source": "@hattip/adapter-node",
              },
              {
                "name": "createHattipEntry",
                "position": 66,
                "source": "fixtures/ytsub-v3/app/misc/entry-hattip",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/misc/entry-hattip.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "createHattipEntry",
                "position": 818,
              },
            ],
            "namedImports": [
              {
                "name": "RequestHandler",
                "position": 9,
                "source": "@hattip/compose",
              },
              {
                "name": "compose",
                "position": 30,
                "source": "@hattip/compose",
              },
              {
                "name": "once",
                "position": 73,
                "source": "@hiogawa/utils",
              },
              {
                "name": "createLoggerHandler",
                "position": 112,
                "source": "@hiogawa/utils-hattip",
              },
              {
                "name": "SpanKind",
                "position": 173,
                "source": "@opentelemetry/api",
              },
              {
                "name": "SemanticAttributes",
                "position": 220,
                "source": "@opentelemetry/semantic-conventions",
              },
              {
                "name": "createRequestHandler",
                "position": 348,
                "source": "@remix-run/server-runtime",
              },
              {
                "name": "requestContextHandler",
                "position": 414,
                "source": "fixtures/ytsub-v3/app/server/request-context",
              },
              {
                "name": "rpcHandler",
                "position": 481,
                "source": "fixtures/ytsub-v3/app/trpc/server",
              },
              {
                "name": "pathToRegExp",
                "position": 526,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "traceAsync",
                "position": 572,
                "source": "fixtures/ytsub-v3/app/utils/opentelemetry-utils",
              },
              {
                "name": "initializeServer",
                "position": 631,
                "source": "fixtures/ytsub-v3/app/misc/initialize-server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [
              {
                "position": 292,
                "source": "@remix-run/dev/server-build",
              },
            ],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/misc/initialize-server.ts",
          "parseOutput": {
            "bareImports": [
              {
                "position": 0,
                "source": "@hiogawa/tiny-jwt/dist/polyfill-node",
              },
            ],
            "namedExports": [
              {
                "name": "initializeServer",
                "position": 381,
              },
              {
                "name": "finalizeServer",
                "position": 547,
              },
            ],
            "namedImports": [
              {
                "name": "finalizeDrizzleClient",
                "position": 58,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "initializeDrizzleClient",
                "position": 83,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "initializeConfigServer",
                "position": 155,
                "source": "fixtures/ytsub-v3/app/utils/config",
              },
              {
                "name": "finalizeOpentelemetry",
                "position": 215,
                "source": "fixtures/ytsub-v3/app/utils/opentelemetry-utils",
              },
              {
                "name": "initializeOpentelemetry",
                "position": 240,
                "source": "fixtures/ytsub-v3/app/utils/opentelemetry-utils",
              },
              {
                "name": "finalizeArgon2",
                "position": 313,
                "source": "fixtures/ytsub-v3/app/utils/password-utils",
              },
              {
                "name": "initializeArgon2",
                "position": 329,
                "source": "fixtures/ytsub-v3/app/utils/password-utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/misc/register-service-worker.client.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "registerServiceWorker",
                "position": 51,
              },
            ],
            "namedImports": [],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/misc/routes.test.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [
              {
                "name": "describe",
                "position": 9,
                "source": "vitest",
              },
              {
                "name": "expect",
                "position": 19,
                "source": "vitest",
              },
              {
                "name": "it",
                "position": 27,
                "source": "vitest",
              },
              {
                "name": "$R",
                "position": 56,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/misc/routes.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "Z_PAGINATION_QUERY",
                "position": 532,
              },
              {
                "name": "Z_DATE_RANGE_TYPE",
                "position": 696,
              },
              {
                "name": "ROUTE_DEF",
                "position": 820,
              },
              {
                "name": "$R",
                "position": 3469,
              },
              {
                "name": "R",
                "position": 4295,
              },
            ],
            "namedImports": [
              {
                "name": "tinyassert",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "z",
                "position": 54,
                "source": "zod",
              },
              {
                "name": "Z_PRACTICE_ACTION_TYPES",
                "position": 79,
                "source": "fixtures/ytsub-v3/app/db/types",
              },
              {
                "name": "Z_PRACTICE_QUEUE_TYPES",
                "position": 104,
                "source": "fixtures/ytsub-v3/app/db/types",
              },
              {
                "name": "createGetProxy",
                "position": 158,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/misc/seed-utils.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "exportDeckJson",
                "position": 470,
              },
              {
                "name": "importDeckJson",
                "position": 598,
              },
              {
                "name": "DEFAULT_SEED_FILE",
                "position": 4542,
              },
              {
                "name": "importSeed",
                "position": 4611,
              },
            ],
            "namedImports": [
              {
                "name": "default",
                "position": 7,
                "source": "fs",
              },
              {
                "name": "UncheckedMap",
                "position": 32,
                "source": "@hiogawa/utils",
              },
              {
                "name": "objectOmit",
                "position": 48,
                "source": "@hiogawa/utils",
              },
              {
                "name": "objectPick",
                "position": 62,
                "source": "@hiogawa/utils",
              },
              {
                "name": "tinyassert",
                "position": 76,
                "source": "@hiogawa/utils",
              },
              {
                "name": "uniq",
                "position": 90,
                "source": "@hiogawa/utils",
              },
              {
                "name": "E",
                "position": 130,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "T",
                "position": 133,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "db",
                "position": 136,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "selectOne",
                "position": 140,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "DEFAULT_DECK_CACHE",
                "position": 197,
                "source": "fixtures/ytsub-v3/app/db/types",
              },
              {
                "name": "JSON_EXTRA",
                "position": 247,
                "source": "fixtures/ytsub-v3/app/utils/json-extra",
              },
              {
                "name": "resetDeckCache",
                "position": 297,
                "source": "fixtures/ytsub-v3/app/utils/practice-system",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/misc/test-helper-common.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "useUserImpl",
                "position": 191,
              },
            ],
            "namedImports": [
              {
                "name": "hashString",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "E",
                "position": 54,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "T",
                "position": 57,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "db",
                "position": 60,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "UserTable",
                "position": 115,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "register",
                "position": 157,
                "source": "fixtures/ytsub-v3/app/utils/auth",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/misc/test-helper-snapshot.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "zSnapshotType",
                "position": 192,
              },
            ],
            "namedImports": [
              {
                "name": "z",
                "position": 9,
                "source": "zod",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/misc/test-helper.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "testLoader",
                "position": 691,
              },
              {
                "name": "useUser",
                "position": 850,
              },
              {
                "name": "useUserVideo",
                "position": 2605,
              },
            ],
            "namedImports": [
              {
                "name": "default",
                "position": 7,
                "source": "node:fs",
              },
              {
                "name": "newPromiseWithResolvers",
                "position": 35,
                "source": "@hiogawa/utils",
              },
              {
                "name": "tinyassert",
                "position": 60,
                "source": "@hiogawa/utils",
              },
              {
                "name": "LoaderFunction",
                "position": 110,
                "source": "@remix-run/server-runtime",
              },
              {
                "name": "afterAll",
                "position": 170,
                "source": "vitest",
              },
              {
                "name": "beforeAll",
                "position": 180,
                "source": "vitest",
              },
              {
                "name": "E",
                "position": 216,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "T",
                "position": 219,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "db",
                "position": 222,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "getVideoAndCaptionEntries",
                "position": 274,
                "source": "fixtures/ytsub-v3/app/db/helper",
              },
              {
                "name": "insertVideoAndCaptionEntries",
                "position": 303,
                "source": "fixtures/ytsub-v3/app/db/helper",
              },
              {
                "name": "CaptionEntryTable",
                "position": 370,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "UserTable",
                "position": 389,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "VideoTable",
                "position": 400,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "writeCookieSession",
                "position": 443,
                "source": "fixtures/ytsub-v3/app/server/request-context/session",
              },
              {
                "name": "ctx_get",
                "position": 515,
                "source": "fixtures/ytsub-v3/app/server/request-context/storage",
              },
              {
                "name": "NewVideo",
                "position": 581,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "fetchCaptionEntries",
                "position": 591,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "useUserImpl",
                "position": 647,
                "source": "fixtures/ytsub-v3/app/misc/test-helper-common",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/misc/test-setup-common.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "testSetupCommon",
                "position": 57,
              },
            ],
            "namedImports": [
              {
                "name": "initializeServer",
                "position": 9,
                "source": "fixtures/ytsub-v3/app/misc/initialize-server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/misc/test-setup-global-e2e.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "default",
                "position": 169,
              },
            ],
            "namedImports": [
              {
                "name": "finalizeDrizzleClient",
                "position": 9,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "truncateAll",
                "position": 78,
                "source": "fixtures/ytsub-v3/app/db/helper",
              },
              {
                "name": "testSetupCommon",
                "position": 122,
                "source": "fixtures/ytsub-v3/app/misc/test-setup-common",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/misc/test-setup-global.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "default",
                "position": 169,
              },
            ],
            "namedImports": [
              {
                "name": "finalizeDrizzleClient",
                "position": 9,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "truncateAll",
                "position": 78,
                "source": "fixtures/ytsub-v3/app/db/helper",
              },
              {
                "name": "testSetupCommon",
                "position": 122,
                "source": "fixtures/ytsub-v3/app/misc/test-setup-common",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/misc/test-setup.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [
              {
                "name": "beforeAll",
                "position": 9,
                "source": "vitest",
              },
              {
                "name": "testSetupCommon",
                "position": 45,
                "source": "fixtures/ytsub-v3/app/misc/test-setup-common",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/root.server.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "loader",
                "position": 249,
              },
            ],
            "namedImports": [
              {
                "name": "TT",
                "position": 9,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "ctx_currentUser",
                "position": 58,
                "source": "fixtures/ytsub-v3/app/server/request-context/session",
              },
              {
                "name": "wrapLoader",
                "position": 126,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/root.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "shouldRevalidate",
                "position": 1380,
              },
              {
                "name": "default",
                "position": 1439,
              },
              {
                "name": "ErrorBoundary",
                "position": 1555,
              },
            ],
            "namedImports": [
              {
                "name": "FloatingTree",
                "position": 9,
                "source": "@floating-ui/react",
              },
              {
                "name": "Compose",
                "position": 60,
                "source": "@hiogawa/utils-react",
              },
              {
                "name": "Link",
                "position": 110,
                "source": "@remix-run/react",
              },
              {
                "name": "LiveReload",
                "position": 118,
                "source": "@remix-run/react",
              },
              {
                "name": "NavLink",
                "position": 132,
                "source": "@remix-run/react",
              },
              {
                "name": "Outlet",
                "position": 143,
                "source": "@remix-run/react",
              },
              {
                "name": "Scripts",
                "position": 153,
                "source": "@remix-run/react",
              },
              {
                "name": "ShouldRevalidateFunction",
                "position": 164,
                "source": "@remix-run/react",
              },
              {
                "name": "useLocation",
                "position": 192,
                "source": "@remix-run/react",
              },
              {
                "name": "useMatches",
                "position": 207,
                "source": "@remix-run/react",
              },
              {
                "name": "useNavigate",
                "position": 221,
                "source": "@remix-run/react",
              },
              {
                "name": "useRouteError",
                "position": 236,
                "source": "@remix-run/react",
              },
              {
                "name": "useMutation",
                "position": 287,
                "source": "@tanstack/react-query",
              },
              {
                "name": "default",
                "position": 338,
                "source": "react",
              },
              {
                "name": "useForm",
                "position": 367,
                "source": "react-hook-form",
              },
              {
                "name": "toast",
                "position": 410,
                "source": "react-hot-toast",
              },
              {
                "name": "Drawer",
                "position": 451,
                "source": "fixtures/ytsub-v3/app/components/drawer",
              },
              {
                "name": "PopoverSimple",
                "position": 497,
                "source": "fixtures/ytsub-v3/app/components/popover",
              },
              {
                "name": "ThemeSelect",
                "position": 551,
                "source": "fixtures/ytsub-v3/app/components/theme-select",
              },
              {
                "name": "TopProgressBarRemix",
                "position": 608,
                "source": "fixtures/ytsub-v3/app/components/top-progress-bar",
              },
              {
                "name": "$R",
                "position": 677,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "R",
                "position": 681,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "rpcClientQuery",
                "position": 716,
                "source": "fixtures/ytsub-v3/app/trpc/client",
              },
              {
                "name": "useCurrentUser",
                "position": 766,
                "source": "fixtures/ytsub-v3/app/utils/current-user",
              },
              {
                "name": "useHydrateCurrentUser",
                "position": 784,
                "source": "fixtures/ytsub-v3/app/utils/current-user",
              },
              {
                "name": "useSetCurrentUser",
                "position": 809,
                "source": "fixtures/ytsub-v3/app/utils/current-user",
              },
              {
                "name": "useFlashMessageHandler",
                "position": 868,
                "source": "fixtures/ytsub-v3/app/utils/flash-message",
              },
              {
                "name": "useLoaderDataExtra",
                "position": 932,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "cls",
                "position": 991,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "PageHandle",
                "position": 1032,
                "source": "fixtures/ytsub-v3/app/utils/page-handle",
              },
              {
                "name": "QueryClientWrapper",
                "position": 1082,
                "source": "fixtures/ytsub-v3/app/utils/react-query-utils",
              },
              {
                "name": "ToastWrapper",
                "position": 1146,
                "source": "fixtures/ytsub-v3/app/utils/toast-utils",
              },
              {
                "name": "LoaderData",
                "position": 1239,
                "source": "fixtures/ytsub-v3/app/root.server",
              },
            ],
            "namedReExports": [
              {
                "name": "loader",
                "nameBefore": undefined,
                "position": 1199,
                "source": "fixtures/ytsub-v3/app/root.server",
              },
            ],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/bookmarks/history-chart.server.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "loader",
                "position": 91,
              },
            ],
            "namedImports": [
              {
                "name": "ctx_requireUserOrRedirect",
                "position": 9,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/bookmarks/history-chart.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "shouldRevalidate",
                "position": 901,
              },
              {
                "name": "handle",
                "position": 980,
              },
              {
                "name": "default",
                "position": 1204,
              },
            ],
            "namedImports": [
              {
                "name": "Transition",
                "position": 9,
                "source": "@headlessui/react",
              },
              {
                "name": "useQuery",
                "position": 57,
                "source": "@tanstack/react-query",
              },
              {
                "name": "default",
                "position": 105,
                "source": "react",
              },
              {
                "name": "SelectWrapper",
                "position": 134,
                "source": "fixtures/ytsub-v3/app/components/misc",
              },
              {
                "name": "transitionProps",
                "position": 149,
                "source": "fixtures/ytsub-v3/app/components/misc",
              },
              {
                "name": "PopoverSimple",
                "position": 206,
                "source": "fixtures/ytsub-v3/app/components/popover",
              },
              {
                "name": "EchartsComponent",
                "position": 266,
                "source": "fixtures/ytsub-v3/app/components/practice-history-chart",
              },
              {
                "name": "createBookmarkHistoryChartOption",
                "position": 286,
                "source": "fixtures/ytsub-v3/app/components/practice-history-chart",
              },
              {
                "name": "ROUTE_DEF",
                "position": 379,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "rpcClientQuery",
                "position": 426,
                "source": "fixtures/ytsub-v3/app/trpc/client",
              },
              {
                "name": "useClickOutside",
                "position": 478,
                "source": "fixtures/ytsub-v3/app/utils/hooks-client-utils",
              },
              {
                "name": "disableUrlQueryRevalidation",
                "position": 546,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "useTypedUrlQuery",
                "position": 577,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "cls",
                "position": 639,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "PageHandle",
                "position": 684,
                "source": "fixtures/ytsub-v3/app/utils/page-handle",
              },
              {
                "name": "formatDateRange",
                "position": 738,
                "source": "fixtures/ytsub-v3/app/utils/temporal-utils",
              },
              {
                "name": "BookmarksMenuItems",
                "position": 800,
                "source": "fixtures/ytsub-v3/app/routes/bookmarks/index",
              },
            ],
            "namedReExports": [
              {
                "name": "loader",
                "nameBefore": undefined,
                "position": 847,
                "source": "fixtures/ytsub-v3/app/routes/bookmarks/history-chart.server",
              },
            ],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/bookmarks/index.server.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "loader",
                "position": 91,
              },
            ],
            "namedImports": [
              {
                "name": "ctx_requireUserOrRedirect",
                "position": 9,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/bookmarks/index.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "shouldRevalidate",
                "position": 1245,
              },
              {
                "name": "handle",
                "position": 1307,
              },
              {
                "name": "default",
                "position": 1413,
              },
              {
                "name": "BookmarkEntryComponent",
                "position": 4033,
              },
              {
                "name": "MiniPlayer",
                "position": 5990,
              },
              {
                "name": "BookmarksMenuItems",
                "position": 13019,
              },
            ],
            "namedImports": [
              {
                "name": "Transition",
                "position": 9,
                "source": "@headlessui/react",
              },
              {
                "name": "typedBoolean",
                "position": 57,
                "source": "@hiogawa/utils",
              },
              {
                "name": "toArraySetState",
                "position": 104,
                "source": "@hiogawa/utils-react",
              },
              {
                "name": "useRafLoop",
                "position": 121,
                "source": "@hiogawa/utils-react",
              },
              {
                "name": "NavLink",
                "position": 172,
                "source": "@remix-run/react",
              },
              {
                "name": "useInfiniteQuery",
                "position": 216,
                "source": "@tanstack/react-query",
              },
              {
                "name": "useQuery",
                "position": 234,
                "source": "@tanstack/react-query",
              },
              {
                "name": "default",
                "position": 282,
                "source": "react",
              },
              {
                "name": "useForm",
                "position": 311,
                "source": "react-hook-form",
              },
              {
                "name": "CollapseTransition",
                "position": 354,
                "source": "fixtures/ytsub-v3/app/components/collapse",
              },
              {
                "name": "SelectWrapper",
                "position": 418,
                "source": "fixtures/ytsub-v3/app/components/misc",
              },
              {
                "name": "transitionProps",
                "position": 433,
                "source": "fixtures/ytsub-v3/app/components/misc",
              },
              {
                "name": "PopoverSimple",
                "position": 490,
                "source": "fixtures/ytsub-v3/app/components/popover",
              },
              {
                "name": "TT",
                "position": 553,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "BookmarkEntryTable",
                "position": 613,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "CaptionEntryTable",
                "position": 635,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "VideoTable",
                "position": 656,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "$R",
                "position": 703,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "ROUTE_DEF",
                "position": 707,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "rpcClientQuery",
                "position": 754,
                "source": "fixtures/ytsub-v3/app/trpc/client",
              },
              {
                "name": "disableUrlQueryRevalidation",
                "position": 808,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "useTypedUrlQuery",
                "position": 839,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "cls",
                "position": 901,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "PageHandle",
                "position": 946,
                "source": "fixtures/ytsub-v3/app/utils/page-handle",
              },
              {
                "name": "CaptionEntry",
                "position": 1005,
                "source": "fixtures/ytsub-v3/app/utils/types",
              },
              {
                "name": "YoutubePlayer",
                "position": 1055,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "usePlayerLoader",
                "position": 1070,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "CaptionEntryComponent",
                "position": 1125,
                "source": "fixtures/ytsub-v3/app/routes/videos/$id",
              },
              {
                "name": "findCurrentEntry",
                "position": 1148,
                "source": "fixtures/ytsub-v3/app/routes/videos/$id",
              },
            ],
            "namedReExports": [
              {
                "name": "loader",
                "nameBefore": undefined,
                "position": 1199,
                "source": "fixtures/ytsub-v3/app/routes/bookmarks/index.server",
              },
            ],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/caption-editor/index.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "handle",
                "position": 386,
              },
              {
                "name": "default",
                "position": 452,
              },
            ],
            "namedImports": [
              {
                "name": "Link",
                "position": 9,
                "source": "@remix-run/react",
              },
              {
                "name": "useNavigate",
                "position": 15,
                "source": "@remix-run/react",
              },
              {
                "name": "useForm",
                "position": 63,
                "source": "react-hook-form",
              },
              {
                "name": "STORAGE_KEYS",
                "position": 108,
                "source": "fixtures/ytsub-v3/app/components/caption-editor-utils",
              },
              {
                "name": "Z_CAPTION_EDITOR_DRAFT_LIST",
                "position": 124,
                "source": "fixtures/ytsub-v3/app/components/caption-editor-utils",
              },
              {
                "name": "useLocalStorage",
                "position": 155,
                "source": "fixtures/ytsub-v3/app/components/caption-editor-utils",
              },
              {
                "name": "$R",
                "position": 229,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "ClientOnly",
                "position": 269,
                "source": "fixtures/ytsub-v3/app/utils/misc-react",
              },
              {
                "name": "PageHandle",
                "position": 327,
                "source": "fixtures/ytsub-v3/app/utils/page-handle",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/caption-editor/watch.server.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "loader",
                "position": 442,
              },
            ],
            "namedImports": [
              {
                "name": "ROUTE_DEF",
                "position": 9,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "ctx_get",
                "position": 56,
                "source": "fixtures/ytsub-v3/app/server/request-context/storage",
              },
              {
                "name": "assertOrRespond",
                "position": 122,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
              {
                "name": "unwrapZodResultOrRespond",
                "position": 141,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
              {
                "name": "wrapLoader",
                "position": 169,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
              {
                "name": "VideoMetadata",
                "position": 232,
                "source": "fixtures/ytsub-v3/app/utils/types",
              },
              {
                "name": "fetchVideoMetadata",
                "position": 283,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "parseVideoId",
                "position": 303,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/caption-editor/watch.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "handle",
                "position": 541,
              },
              {
                "name": "default",
                "position": 607,
              },
            ],
            "namedImports": [
              {
                "name": "uniqBy",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "CaptionEditor",
                "position": 50,
                "source": "fixtures/ytsub-v3/app/components/caption-editor",
              },
              {
                "name": "STORAGE_KEYS",
                "position": 117,
                "source": "fixtures/ytsub-v3/app/components/caption-editor-utils",
              },
              {
                "name": "Z_CAPTION_EDITOR_DRAFT_LIST",
                "position": 133,
                "source": "fixtures/ytsub-v3/app/components/caption-editor-utils",
              },
              {
                "name": "Z_CAPTION_EDITOR_ENTRY_LIST",
                "position": 164,
                "source": "fixtures/ytsub-v3/app/components/caption-editor-utils",
              },
              {
                "name": "useLocalStorage",
                "position": 195,
                "source": "fixtures/ytsub-v3/app/components/caption-editor-utils",
              },
              {
                "name": "useLoaderDataExtra",
                "position": 269,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "ClientOnly",
                "position": 332,
                "source": "fixtures/ytsub-v3/app/utils/misc-react",
              },
              {
                "name": "PageHandle",
                "position": 390,
                "source": "fixtures/ytsub-v3/app/utils/page-handle",
              },
              {
                "name": "LoaderData",
                "position": 450,
                "source": "fixtures/ytsub-v3/app/routes/caption-editor/watch.server",
              },
            ],
            "namedReExports": [
              {
                "name": "loader",
                "nameBefore": undefined,
                "position": 495,
                "source": "fixtures/ytsub-v3/app/routes/caption-editor/watch.server",
              },
            ],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/decks/$id/_utils.server.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "loader",
                "position": 424,
              },
              {
                "name": "ctx_requireUserAndDeck",
                "position": 578,
              },
            ],
            "namedImports": [
              {
                "name": "E",
                "position": 9,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "T",
                "position": 12,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "db",
                "position": 15,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "limitOne",
                "position": 19,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "DeckTable",
                "position": 86,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "ROUTE_DEF",
                "position": 134,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "ctx_get",
                "position": 184,
                "source": "fixtures/ytsub-v3/app/server/request-context/storage",
              },
              {
                "name": "assertOrRespond",
                "position": 253,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
              {
                "name": "ctx_requireUserOrRedirect",
                "position": 272,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
              {
                "name": "wrapLoader",
                "position": 301,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/decks/$id/edit.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "handle",
                "position": 710,
              },
              {
                "name": "default",
                "position": 820,
              },
            ],
            "namedImports": [
              {
                "name": "useNavigate",
                "position": 9,
                "source": "@remix-run/react",
              },
              {
                "name": "useMutation",
                "position": 57,
                "source": "@tanstack/react-query",
              },
              {
                "name": "useForm",
                "position": 110,
                "source": "react-hook-form",
              },
              {
                "name": "toast",
                "position": 153,
                "source": "react-hot-toast",
              },
              {
                "name": "DeckNavBarMenuComponent",
                "position": 194,
                "source": "fixtures/ytsub-v3/app/routes/decks/$id",
              },
              {
                "name": "$R",
                "position": 239,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "R",
                "position": 243,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "rpcClientQuery",
                "position": 285,
                "source": "fixtures/ytsub-v3/app/trpc/client",
              },
              {
                "name": "intl",
                "position": 340,
                "source": "fixtures/ytsub-v3/app/utils/intl",
              },
              {
                "name": "useLoaderDataExtra",
                "position": 384,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "cls",
                "position": 450,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "PageHandle",
                "position": 498,
                "source": "fixtures/ytsub-v3/app/utils/page-handle",
              },
              {
                "name": "toastInfo",
                "position": 555,
                "source": "fixtures/ytsub-v3/app/utils/toast-utils",
              },
              {
                "name": "LoaderData",
                "position": 617,
                "source": "fixtures/ytsub-v3/app/routes/decks/$id/_utils.server",
              },
            ],
            "namedReExports": [
              {
                "name": "loader",
                "nameBefore": undefined,
                "position": 663,
                "source": "fixtures/ytsub-v3/app/routes/decks/$id/_utils.server",
              },
            ],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/decks/$id/export.server.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "loader",
                "position": 246,
              },
            ],
            "namedImports": [
              {
                "name": "json",
                "position": 9,
                "source": "@remix-run/server-runtime",
              },
              {
                "name": "exportDeckJson",
                "position": 59,
                "source": "fixtures/ytsub-v3/app/misc/seed-utils",
              },
              {
                "name": "wrapLoader",
                "position": 118,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
              {
                "name": "ctx_requireUserAndDeck",
                "position": 183,
                "source": "fixtures/ytsub-v3/app/routes/decks/$id/_utils.server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/decks/$id/export.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [],
            "namedReExports": [
              {
                "name": "loader",
                "nameBefore": undefined,
                "position": 9,
                "source": "fixtures/ytsub-v3/app/routes/decks/$id/export.server",
              },
            ],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/decks/$id/history-graph.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "shouldRevalidate",
                "position": 1003,
              },
              {
                "name": "handle",
                "position": 1065,
              },
              {
                "name": "default",
                "position": 1222,
              },
              {
                "name": "DeckHistoryNavBarMenuComponent",
                "position": 4773,
              },
            ],
            "namedImports": [
              {
                "name": "Transition",
                "position": 9,
                "source": "@headlessui/react",
              },
              {
                "name": "useQuery",
                "position": 57,
                "source": "@tanstack/react-query",
              },
              {
                "name": "ECharts",
                "position": 112,
                "source": "echarts",
              },
              {
                "name": "default",
                "position": 145,
                "source": "react",
              },
              {
                "name": "DeckNavBarMenuComponent",
                "position": 174,
                "source": "fixtures/ytsub-v3/app/routes/decks/$id",
              },
              {
                "name": "SelectWrapper",
                "position": 219,
                "source": "fixtures/ytsub-v3/app/components/misc",
              },
              {
                "name": "transitionProps",
                "position": 234,
                "source": "fixtures/ytsub-v3/app/components/misc",
              },
              {
                "name": "EchartsComponent",
                "position": 296,
                "source": "fixtures/ytsub-v3/app/components/practice-history-chart",
              },
              {
                "name": "practiceHistoryChartDataToEchartsOption",
                "position": 316,
                "source": "fixtures/ytsub-v3/app/components/practice-history-chart",
              },
              {
                "name": "ROUTE_DEF",
                "position": 419,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "rpcClientQuery",
                "position": 469,
                "source": "fixtures/ytsub-v3/app/trpc/client",
              },
              {
                "name": "useClickOutside",
                "position": 524,
                "source": "fixtures/ytsub-v3/app/utils/hooks-client-utils",
              },
              {
                "name": "disableUrlQueryRevalidation",
                "position": 595,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "useLeafLoaderData",
                "position": 626,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "useLoaderDataExtra",
                "position": 647,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "useTypedUrlQuery",
                "position": 669,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "cls",
                "position": 734,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "PageHandle",
                "position": 782,
                "source": "fixtures/ytsub-v3/app/utils/page-handle",
              },
              {
                "name": "formatDateRange",
                "position": 839,
                "source": "fixtures/ytsub-v3/app/utils/temporal-utils",
              },
              {
                "name": "LoaderData",
                "position": 910,
                "source": "fixtures/ytsub-v3/app/routes/decks/$id/_utils.server",
              },
            ],
            "namedReExports": [
              {
                "name": "loader",
                "nameBefore": undefined,
                "position": 956,
                "source": "fixtures/ytsub-v3/app/routes/decks/$id/_utils.server",
              },
            ],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/decks/$id/history.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "shouldRevalidate",
                "position": 1197,
              },
              {
                "name": "handle",
                "position": 1259,
              },
              {
                "name": "default",
                "position": 1389,
              },
            ],
            "namedImports": [
              {
                "name": "Transition",
                "position": 9,
                "source": "@headlessui/react",
              },
              {
                "name": "useInfiniteQuery",
                "position": 57,
                "source": "@tanstack/react-query",
              },
              {
                "name": "useQuery",
                "position": 75,
                "source": "@tanstack/react-query",
              },
              {
                "name": "default",
                "position": 123,
                "source": "react",
              },
              {
                "name": "PRACTICE_ACTION_TYPE_TO_COLOR",
                "position": 152,
                "source": "fixtures/ytsub-v3/app/routes/decks/$id",
              },
              {
                "name": "QueueTypeIcon",
                "position": 183,
                "source": "fixtures/ytsub-v3/app/routes/decks/$id",
              },
              {
                "name": "CollapseTransition",
                "position": 218,
                "source": "fixtures/ytsub-v3/app/components/collapse",
              },
              {
                "name": "SelectWrapper",
                "position": 285,
                "source": "fixtures/ytsub-v3/app/components/misc",
              },
              {
                "name": "transitionProps",
                "position": 300,
                "source": "fixtures/ytsub-v3/app/components/misc",
              },
              {
                "name": "TT",
                "position": 365,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "PRACTICE_ACTION_TYPES",
                "position": 421,
                "source": "fixtures/ytsub-v3/app/db/types",
              },
              {
                "name": "PracticeActionType",
                "position": 444,
                "source": "fixtures/ytsub-v3/app/db/types",
              },
              {
                "name": "ROUTE_DEF",
                "position": 500,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "rpcClientQuery",
                "position": 550,
                "source": "fixtures/ytsub-v3/app/trpc/client",
              },
              {
                "name": "useIntersectionObserver",
                "position": 605,
                "source": "fixtures/ytsub-v3/app/utils/hooks-client-utils",
              },
              {
                "name": "formatRelativeDate",
                "position": 682,
                "source": "fixtures/ytsub-v3/app/utils/intl",
              },
              {
                "name": "disableUrlQueryRevalidation",
                "position": 742,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "useLeafLoaderData",
                "position": 773,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "useLoaderDataExtra",
                "position": 794,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "useTypedUrlQuery",
                "position": 816,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "cls",
                "position": 881,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "PageHandle",
                "position": 929,
                "source": "fixtures/ytsub-v3/app/utils/page-handle",
              },
              {
                "name": "MiniPlayer",
                "position": 986,
                "source": "fixtures/ytsub-v3/app/routes/bookmarks",
              },
              {
                "name": "LoaderData",
                "position": 1037,
                "source": "fixtures/ytsub-v3/app/routes/decks/$id/_utils.server",
              },
              {
                "name": "DeckHistoryNavBarMenuComponent",
                "position": 1084,
                "source": "fixtures/ytsub-v3/app/routes/decks/$id/history-graph",
              },
            ],
            "namedReExports": [
              {
                "name": "loader",
                "nameBefore": undefined,
                "position": 1150,
                "source": "fixtures/ytsub-v3/app/routes/decks/$id/_utils.server",
              },
            ],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/decks/$id/index.server.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "loader",
                "position": 777,
              },
            ],
            "namedImports": [
              {
                "name": "E",
                "position": 11,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "T",
                "position": 16,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "TT",
                "position": 21,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "db",
                "position": 27,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "toPaginationResult",
                "position": 33,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "DeckTable",
                "position": 111,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "PracticeEntryTable",
                "position": 122,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "ROUTE_DEF",
                "position": 179,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "ctx_get",
                "position": 229,
                "source": "fixtures/ytsub-v3/app/server/request-context/storage",
              },
              {
                "name": "wrapLoader",
                "position": 296,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
              {
                "name": "PaginationMetadata",
                "position": 366,
                "source": "fixtures/ytsub-v3/app/utils/pagination",
              },
              {
                "name": "ctx_requireUserAndDeck",
                "position": 430,
                "source": "fixtures/ytsub-v3/app/routes/decks/$id/_utils.server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/decks/$id/index.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "handle",
                "position": 1037,
              },
              {
                "name": "default",
                "position": 1160,
              },
              {
                "name": "QueueStatisticsComponent",
                "position": 2208,
              },
              {
                "name": "PRACTICE_ACTION_TYPE_TO_COLOR",
                "position": 4049,
              },
              {
                "name": "QueueTypeIcon",
                "position": 6670,
              },
              {
                "name": "DeckNavBarMenuComponent",
                "position": 7137,
              },
              {
                "name": "DeckMenuComponent",
                "position": 7282,
              },
            ],
            "namedImports": [
              {
                "name": "Transition",
                "position": 9,
                "source": "@headlessui/react",
              },
              {
                "name": "Link",
                "position": 57,
                "source": "@remix-run/react",
              },
              {
                "name": "NavLink",
                "position": 63,
                "source": "@remix-run/react",
              },
              {
                "name": "useQuery",
                "position": 107,
                "source": "@tanstack/react-query",
              },
              {
                "name": "default",
                "position": 155,
                "source": "react",
              },
              {
                "name": "PaginationComponent",
                "position": 184,
                "source": "fixtures/ytsub-v3/app/components/misc",
              },
              {
                "name": "transitionProps",
                "position": 205,
                "source": "fixtures/ytsub-v3/app/components/misc",
              },
              {
                "name": "PopoverSimple",
                "position": 265,
                "source": "fixtures/ytsub-v3/app/components/popover",
              },
              {
                "name": "BookmarkEntryTable",
                "position": 333,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "CaptionEntryTable",
                "position": 355,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "DeckTable",
                "position": 376,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "VideoTable",
                "position": 389,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "PracticeActionType",
                "position": 444,
                "source": "fixtures/ytsub-v3/app/db/types",
              },
              {
                "name": "PracticeQueueType",
                "position": 464,
                "source": "fixtures/ytsub-v3/app/db/types",
              },
              {
                "name": "$R",
                "position": 519,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "rpcClientQuery",
                "position": 562,
                "source": "fixtures/ytsub-v3/app/trpc/client",
              },
              {
                "name": "intl",
                "position": 617,
                "source": "fixtures/ytsub-v3/app/utils/intl",
              },
              {
                "name": "intlWrapper",
                "position": 623,
                "source": "fixtures/ytsub-v3/app/utils/intl",
              },
              {
                "name": "useLeafLoaderData",
                "position": 676,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "useLoaderDataExtra",
                "position": 697,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "cls",
                "position": 764,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "PageHandle",
                "position": 812,
                "source": "fixtures/ytsub-v3/app/utils/page-handle",
              },
              {
                "name": "MiniPlayer",
                "position": 869,
                "source": "fixtures/ytsub-v3/app/routes/bookmarks",
              },
              {
                "name": "LoaderData",
                "position": 921,
                "source": "fixtures/ytsub-v3/app/routes/decks/$id/index.server",
              },
              {
                "name": "PracticeEntryTableExtra",
                "position": 933,
                "source": "fixtures/ytsub-v3/app/routes/decks/$id/index.server",
              },
            ],
            "namedReExports": [
              {
                "name": "loader",
                "nameBefore": undefined,
                "position": 991,
                "source": "fixtures/ytsub-v3/app/routes/decks/$id/index.server",
              },
            ],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/decks/$id/practice.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "handle",
                "position": 962,
              },
              {
                "name": "default",
                "position": 1085,
              },
            ],
            "namedImports": [
              {
                "name": "Transition",
                "position": 9,
                "source": "@headlessui/react",
              },
              {
                "name": "useMutation",
                "position": 57,
                "source": "@tanstack/react-query",
              },
              {
                "name": "useQuery",
                "position": 70,
                "source": "@tanstack/react-query",
              },
              {
                "name": "useQueryClient",
                "position": 80,
                "source": "@tanstack/react-query",
              },
              {
                "name": "default",
                "position": 134,
                "source": "react",
              },
              {
                "name": "toast",
                "position": 163,
                "source": "react-hot-toast",
              },
              {
                "name": "transitionProps",
                "position": 204,
                "source": "fixtures/ytsub-v3/app/components/misc",
              },
              {
                "name": "BookmarkEntryTable",
                "position": 271,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "CaptionEntryTable",
                "position": 293,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "DeckTable",
                "position": 314,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "PracticeEntryTable",
                "position": 327,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "VideoTable",
                "position": 349,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "PRACTICE_ACTION_TYPES",
                "position": 399,
                "source": "fixtures/ytsub-v3/app/db/types",
              },
              {
                "name": "PracticeActionType",
                "position": 422,
                "source": "fixtures/ytsub-v3/app/db/types",
              },
              {
                "name": "rpcClientQuery",
                "position": 478,
                "source": "fixtures/ytsub-v3/app/trpc/client",
              },
              {
                "name": "useLeafLoaderData",
                "position": 535,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "useLoaderDataExtra",
                "position": 556,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "cls",
                "position": 623,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "PageHandle",
                "position": 671,
                "source": "fixtures/ytsub-v3/app/utils/page-handle",
              },
              {
                "name": "BookmarkEntryComponent",
                "position": 728,
                "source": "fixtures/ytsub-v3/app/routes/bookmarks",
              },
              {
                "name": "LoaderData",
                "position": 791,
                "source": "fixtures/ytsub-v3/app/routes/decks/$id/_utils.server",
              },
              {
                "name": "DeckNavBarMenuComponent",
                "position": 838,
                "source": "fixtures/ytsub-v3/app/routes/decks/$id/index",
              },
              {
                "name": "QueueStatisticsComponent",
                "position": 863,
                "source": "fixtures/ytsub-v3/app/routes/decks/$id/index",
              },
            ],
            "namedReExports": [
              {
                "name": "loader",
                "nameBefore": undefined,
                "position": 915,
                "source": "fixtures/ytsub-v3/app/routes/decks/$id/_utils.server",
              },
            ],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/decks/import.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "handle",
                "position": 429,
              },
              {
                "name": "default",
                "position": 492,
              },
            ],
            "namedImports": [
              {
                "name": "tinyassert",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "useNavigate",
                "position": 54,
                "source": "@remix-run/react",
              },
              {
                "name": "useMutation",
                "position": 102,
                "source": "@tanstack/react-query",
              },
              {
                "name": "useForm",
                "position": 155,
                "source": "react-hook-form",
              },
              {
                "name": "toast",
                "position": 198,
                "source": "react-hot-toast",
              },
              {
                "name": "R",
                "position": 239,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "rpcClient",
                "position": 278,
                "source": "fixtures/ytsub-v3/app/trpc/client",
              },
              {
                "name": "cls",
                "position": 325,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "PageHandle",
                "position": 370,
                "source": "fixtures/ytsub-v3/app/utils/page-handle",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/decks/index.server.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "loader",
                "position": 277,
              },
            ],
            "namedImports": [
              {
                "name": "E",
                "position": 9,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "T",
                "position": 12,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "db",
                "position": 15,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "DeckTable",
                "position": 73,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "ctx_requireUserOrRedirect",
                "position": 120,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
              {
                "name": "wrapLoader",
                "position": 149,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/decks/index.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "handle",
                "position": 407,
              },
              {
                "name": "default",
                "position": 518,
              },
            ],
            "namedImports": [
              {
                "name": "Link",
                "position": 9,
                "source": "@remix-run/react",
              },
              {
                "name": "DeckTable",
                "position": 55,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "$R",
                "position": 100,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "useLoaderDataExtra",
                "position": 140,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "PageHandle",
                "position": 208,
                "source": "fixtures/ytsub-v3/app/utils/page-handle",
              },
              {
                "name": "DeckMenuComponent",
                "position": 262,
                "source": "fixtures/ytsub-v3/app/routes/decks/$id",
              },
              {
                "name": "DecksLoaderData",
                "position": 311,
                "source": "fixtures/ytsub-v3/app/routes/decks/index.server",
              },
            ],
            "namedReExports": [
              {
                "name": "loader",
                "nameBefore": undefined,
                "position": 361,
                "source": "fixtures/ytsub-v3/app/routes/decks/index.server",
              },
            ],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/decks/new.server.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "loader",
                "position": 108,
              },
            ],
            "namedImports": [
              {
                "name": "ctx_requireUserOrRedirect",
                "position": 11,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
              {
                "name": "wrapLoader",
                "position": 40,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/decks/new.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "handle",
                "position": 426,
              },
              {
                "name": "default",
                "position": 486,
              },
            ],
            "namedImports": [
              {
                "name": "useNavigate",
                "position": 9,
                "source": "@remix-run/react",
              },
              {
                "name": "useMutation",
                "position": 57,
                "source": "@tanstack/react-query",
              },
              {
                "name": "useForm",
                "position": 110,
                "source": "react-hook-form",
              },
              {
                "name": "default",
                "position": 151,
                "source": "react-hot-toast",
              },
              {
                "name": "$R",
                "position": 190,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "rpcClientQuery",
                "position": 230,
                "source": "fixtures/ytsub-v3/app/trpc/client",
              },
              {
                "name": "cls",
                "position": 282,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "PageHandle",
                "position": 327,
                "source": "fixtures/ytsub-v3/app/utils/page-handle",
              },
            ],
            "namedReExports": [
              {
                "name": "loader",
                "nameBefore": undefined,
                "position": 382,
                "source": "fixtures/ytsub-v3/app/routes/decks/new.server",
              },
            ],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/dev/debug-env.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "loader",
                "position": 460,
              },
            ],
            "namedImports": [
              {
                "name": "sortBy",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "LoaderFunction",
                "position": 55,
                "source": "@remix-run/server-runtime",
              },
              {
                "name": "prettierJson",
                "position": 115,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "verifyPassword",
                "position": 172,
                "source": "fixtures/ytsub-v3/app/utils/password-utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/dev/debug.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "loader",
                "position": 136,
              },
            ],
            "namedImports": [
              {
                "name": "LoaderFunction",
                "position": 14,
                "source": "@remix-run/server-runtime",
              },
              {
                "name": "prettierJson",
                "position": 74,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/dev/emails.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "loader",
                "position": 191,
              },
            ],
            "namedImports": [
              {
                "name": "LoaderFunction",
                "position": 14,
                "source": "@remix-run/server-runtime",
              },
              {
                "name": "debugEmails",
                "position": 74,
                "source": "fixtures/ytsub-v3/app/utils/email-utils",
              },
              {
                "name": "prettierJson",
                "position": 129,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/dev/health-check-db.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "loader",
                "position": 147,
              },
            ],
            "namedImports": [
              {
                "name": "LoaderFunction",
                "position": 14,
                "source": "@remix-run/server-runtime",
              },
              {
                "name": "T",
                "position": 74,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "db",
                "position": 77,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "toCountSql",
                "position": 81,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/dev/health-check.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "loader",
                "position": 79,
              },
            ],
            "namedImports": [
              {
                "name": "LoaderFunction",
                "position": 14,
                "source": "@remix-run/server-runtime",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/dev/knex.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "loader",
                "position": 192,
              },
            ],
            "namedImports": [
              {
                "name": "LoaderFunction",
                "position": 14,
                "source": "@remix-run/server-runtime",
              },
              {
                "name": "T",
                "position": 74,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "db",
                "position": 77,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "prettierJson",
                "position": 130,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/dev/stop.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "loader",
                "position": 174,
              },
            ],
            "namedImports": [
              {
                "name": "default",
                "position": 7,
                "source": "process",
              },
              {
                "name": "LoaderFunction",
                "position": 45,
                "source": "@remix-run/server-runtime",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/index.server.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "loader",
                "position": 321,
              },
            ],
            "namedImports": [
              {
                "name": "ctx_get",
                "position": 9,
                "source": "fixtures/ytsub-v3/app/server/request-context/storage",
              },
              {
                "name": "wrapLoader",
                "position": 70,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
              {
                "name": "PAGINATION_PARAMS_SCHEMA",
                "position": 129,
                "source": "fixtures/ytsub-v3/app/utils/pagination",
              },
              {
                "name": "VideosLoaderData",
                "position": 193,
                "source": "fixtures/ytsub-v3/app/routes/videos/index.server",
              },
              {
                "name": "getVideosLoaderData",
                "position": 211,
                "source": "fixtures/ytsub-v3/app/routes/videos/index.server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/index.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "handle",
                "position": 269,
              },
              {
                "name": "default",
                "position": 329,
              },
            ],
            "namedImports": [
              {
                "name": "useLoaderDataExtra",
                "position": 9,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "PageHandle",
                "position": 74,
                "source": "fixtures/ytsub-v3/app/utils/page-handle",
              },
              {
                "name": "VideoListComponent",
                "position": 125,
                "source": "fixtures/ytsub-v3/app/routes/videos",
              },
              {
                "name": "LoaderData",
                "position": 219,
                "source": "fixtures/ytsub-v3/app/routes/index.server",
              },
            ],
            "namedReExports": [
              {
                "name": "loader",
                "nameBefore": undefined,
                "position": 173,
                "source": "fixtures/ytsub-v3/app/routes/index.server",
              },
            ],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/share-target.server.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "loader",
                "position": 335,
              },
            ],
            "namedImports": [
              {
                "name": "redirect",
                "position": 9,
                "source": "@remix-run/server-runtime",
              },
              {
                "name": "$R",
                "position": 63,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "ROUTE_DEF",
                "position": 67,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "ctx_get",
                "position": 111,
                "source": "fixtures/ytsub-v3/app/server/request-context/storage",
              },
              {
                "name": "assertOrRespond",
                "position": 174,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
              {
                "name": "unwrapZodResultOrRespond",
                "position": 193,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
              {
                "name": "wrapLoader",
                "position": 221,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
              {
                "name": "parseVideoId",
                "position": 281,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/share-target.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "default",
                "position": 48,
              },
            ],
            "namedImports": [],
            "namedReExports": [
              {
                "name": "loader",
                "nameBefore": undefined,
                "position": 9,
                "source": "fixtures/ytsub-v3/app/routes/share-target.server",
              },
            ],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/users/me.server.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "loader",
                "position": 108,
              },
            ],
            "namedImports": [
              {
                "name": "ctx_requireUserOrRedirect",
                "position": 11,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
              {
                "name": "wrapLoader",
                "position": 40,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/users/me.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "handle",
                "position": 807,
              },
              {
                "name": "default",
                "position": 866,
              },
            ],
            "namedImports": [
              {
                "name": "useNavigate",
                "position": 9,
                "source": "@remix-run/react",
              },
              {
                "name": "useMutation",
                "position": 57,
                "source": "@tanstack/react-query",
              },
              {
                "name": "useForm",
                "position": 110,
                "source": "react-hook-form",
              },
              {
                "name": "default",
                "position": 151,
                "source": "react-hot-toast",
              },
              {
                "name": "useModal",
                "position": 190,
                "source": "fixtures/ytsub-v3/app/components/modal",
              },
              {
                "name": "PopoverSimple",
                "position": 241,
                "source": "fixtures/ytsub-v3/app/components/popover",
              },
              {
                "name": "UserTable",
                "position": 304,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "rpcClient",
                "position": 349,
                "source": "fixtures/ytsub-v3/app/trpc/client",
              },
              {
                "name": "rpcClientQuery",
                "position": 360,
                "source": "fixtures/ytsub-v3/app/trpc/client",
              },
              {
                "name": "intl",
                "position": 412,
                "source": "fixtures/ytsub-v3/app/utils/intl",
              },
              {
                "name": "FILTERED_LANGUAGE_CODES",
                "position": 455,
                "source": "fixtures/ytsub-v3/app/utils/language",
              },
              {
                "name": "languageCodeToName",
                "position": 482,
                "source": "fixtures/ytsub-v3/app/utils/language",
              },
              {
                "name": "useLeafLoaderData",
                "position": 542,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "cls",
                "position": 604,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "PageHandle",
                "position": 649,
                "source": "fixtures/ytsub-v3/app/utils/page-handle",
              },
              {
                "name": "useTurnstile",
                "position": 703,
                "source": "fixtures/ytsub-v3/app/utils/turnstile-utils",
              },
            ],
            "namedReExports": [
              {
                "name": "loader",
                "nameBefore": undefined,
                "position": 764,
                "source": "fixtures/ytsub-v3/app/routes/users/me.server",
              },
            ],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/users/password-new.server.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "loader",
                "position": 231,
              },
            ],
            "namedImports": [
              {
                "name": "ROUTE_DEF",
                "position": 9,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "ctx_get",
                "position": 56,
                "source": "fixtures/ytsub-v3/app/server/request-context/storage",
              },
              {
                "name": "wrapLoader",
                "position": 120,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/users/password-new.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "handle",
                "position": 555,
              },
              {
                "name": "default",
                "position": 621,
              },
            ],
            "namedImports": [
              {
                "name": "useNavigate",
                "position": 9,
                "source": "@remix-run/react",
              },
              {
                "name": "useMutation",
                "position": 57,
                "source": "@tanstack/react-query",
              },
              {
                "name": "useForm",
                "position": 110,
                "source": "react-hook-form",
              },
              {
                "name": "default",
                "position": 151,
                "source": "react-hot-toast",
              },
              {
                "name": "$R",
                "position": 190,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "rpcClientQuery",
                "position": 230,
                "source": "fixtures/ytsub-v3/app/trpc/client",
              },
              {
                "name": "useLoaderDataExtra",
                "position": 282,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "cls",
                "position": 345,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "PageHandle",
                "position": 390,
                "source": "fixtures/ytsub-v3/app/utils/page-handle",
              },
              {
                "name": "LoaderData",
                "position": 450,
                "source": "fixtures/ytsub-v3/app/routes/users/password-new.server",
              },
            ],
            "namedReExports": [
              {
                "name": "loader",
                "nameBefore": undefined,
                "position": 502,
                "source": "fixtures/ytsub-v3/app/routes/users/password-new.server",
              },
            ],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/users/password-reset.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "handle",
                "position": 441,
              },
              {
                "name": "default",
                "position": 507,
              },
            ],
            "namedImports": [
              {
                "name": "useNavigate",
                "position": 9,
                "source": "@remix-run/react",
              },
              {
                "name": "useMutation",
                "position": 57,
                "source": "@tanstack/react-query",
              },
              {
                "name": "useForm",
                "position": 110,
                "source": "react-hook-form",
              },
              {
                "name": "default",
                "position": 151,
                "source": "react-hot-toast",
              },
              {
                "name": "$R",
                "position": 190,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "rpcClient",
                "position": 230,
                "source": "fixtures/ytsub-v3/app/trpc/client",
              },
              {
                "name": "cls",
                "position": 277,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "PageHandle",
                "position": 322,
                "source": "fixtures/ytsub-v3/app/utils/page-handle",
              },
              {
                "name": "useTurnstile",
                "position": 376,
                "source": "fixtures/ytsub-v3/app/utils/turnstile-utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/users/register.server.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "loader",
                "position": 313,
              },
            ],
            "namedImports": [
              {
                "name": "redirect",
                "position": 9,
                "source": "@remix-run/server-runtime",
              },
              {
                "name": "R",
                "position": 63,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "ctx_currentUser",
                "position": 102,
                "source": "fixtures/ytsub-v3/app/server/request-context/session",
              },
              {
                "name": "ctx_setFlashMessage",
                "position": 174,
                "source": "fixtures/ytsub-v3/app/utils/flash-message.server",
              },
              {
                "name": "wrapLoader",
                "position": 246,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/users/register.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "handle",
                "position": 611,
              },
              {
                "name": "default",
                "position": 671,
              },
            ],
            "namedImports": [
              {
                "name": "Temporal",
                "position": 9,
                "source": "@js-temporal/polyfill",
              },
              {
                "name": "Link",
                "position": 59,
                "source": "@remix-run/react",
              },
              {
                "name": "useNavigate",
                "position": 65,
                "source": "@remix-run/react",
              },
              {
                "name": "useMutation",
                "position": 113,
                "source": "@tanstack/react-query",
              },
              {
                "name": "useForm",
                "position": 166,
                "source": "react-hook-form",
              },
              {
                "name": "toast",
                "position": 209,
                "source": "react-hot-toast",
              },
              {
                "name": "$R",
                "position": 250,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "R",
                "position": 254,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "rpcClient",
                "position": 293,
                "source": "fixtures/ytsub-v3/app/trpc/client",
              },
              {
                "name": "useSetCurrentUser",
                "position": 340,
                "source": "fixtures/ytsub-v3/app/utils/current-user",
              },
              {
                "name": "cls",
                "position": 402,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "PageHandle",
                "position": 447,
                "source": "fixtures/ytsub-v3/app/utils/page-handle",
              },
              {
                "name": "useTurnstile",
                "position": 501,
                "source": "fixtures/ytsub-v3/app/utils/turnstile-utils",
              },
            ],
            "namedReExports": [
              {
                "name": "loader",
                "nameBefore": undefined,
                "position": 562,
                "source": "fixtures/ytsub-v3/app/routes/users/register.server",
              },
            ],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/users/signin.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "handle",
                "position": 458,
              },
              {
                "name": "default",
                "position": 618,
              },
            ],
            "namedImports": [
              {
                "name": "Link",
                "position": 9,
                "source": "@remix-run/react",
              },
              {
                "name": "useNavigate",
                "position": 15,
                "source": "@remix-run/react",
              },
              {
                "name": "useMutation",
                "position": 63,
                "source": "@tanstack/react-query",
              },
              {
                "name": "useForm",
                "position": 116,
                "source": "react-hook-form",
              },
              {
                "name": "toast",
                "position": 159,
                "source": "react-hot-toast",
              },
              {
                "name": "$R",
                "position": 200,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "rpcClientQuery",
                "position": 240,
                "source": "fixtures/ytsub-v3/app/trpc/client",
              },
              {
                "name": "useSetCurrentUser",
                "position": 292,
                "source": "fixtures/ytsub-v3/app/utils/current-user",
              },
              {
                "name": "cls",
                "position": 354,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "PageHandle",
                "position": 399,
                "source": "fixtures/ytsub-v3/app/utils/page-handle",
              },
            ],
            "namedReExports": [
              {
                "name": "loader",
                "nameBefore": undefined,
                "position": 569,
                "source": "fixtures/ytsub-v3/app/routes/users/register",
              },
            ],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/users/verify.server.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "loader",
                "position": 486,
              },
            ],
            "namedImports": [
              {
                "name": "json",
                "position": 9,
                "source": "@remix-run/server-runtime",
              },
              {
                "name": "redirect",
                "position": 15,
                "source": "@remix-run/server-runtime",
              },
              {
                "name": "R",
                "position": 69,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "ROUTE_DEF",
                "position": 72,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "ctx_currentUser",
                "position": 119,
                "source": "fixtures/ytsub-v3/app/server/request-context/session",
              },
              {
                "name": "ctx_get",
                "position": 191,
                "source": "fixtures/ytsub-v3/app/server/request-context/storage",
              },
              {
                "name": "updateEmailByCode",
                "position": 255,
                "source": "fixtures/ytsub-v3/app/trpc/routes/users",
              },
              {
                "name": "ctx_setFlashMessage",
                "position": 316,
                "source": "fixtures/ytsub-v3/app/utils/flash-message.server",
              },
              {
                "name": "unwrapZodResultOrRespond",
                "position": 390,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
              {
                "name": "wrapLoader",
                "position": 418,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/users/verify.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "default",
                "position": 42,
              },
            ],
            "namedImports": [],
            "namedReExports": [
              {
                "name": "loader",
                "nameBefore": undefined,
                "position": 9,
                "source": "fixtures/ytsub-v3/app/routes/users/verify.server",
              },
            ],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/videos/$id.server.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "loader",
                "position": 511,
              },
            ],
            "namedImports": [
              {
                "name": "E",
                "position": 9,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "T",
                "position": 12,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "TT",
                "position": 15,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "selectOne",
                "position": 19,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "VideoTable",
                "position": 84,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "ROUTE_DEF",
                "position": 130,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "ctx_currentUser",
                "position": 177,
                "source": "fixtures/ytsub-v3/app/server/request-context/session",
              },
              {
                "name": "ctx_get",
                "position": 249,
                "source": "fixtures/ytsub-v3/app/server/request-context/storage",
              },
              {
                "name": "assertOrRespond",
                "position": 315,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
              {
                "name": "unwrapZodResultOrRespond",
                "position": 334,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
              {
                "name": "wrapLoader",
                "position": 362,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/videos/$id.test.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [
              {
                "name": "describe",
                "position": 9,
                "source": "vitest",
              },
              {
                "name": "expect",
                "position": 19,
                "source": "vitest",
              },
              {
                "name": "it",
                "position": 27,
                "source": "vitest",
              },
              {
                "name": "partitionRanges",
                "position": 56,
                "source": "fixtures/ytsub-v3/app/routes/videos/$id",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/videos/$id.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "shouldRevalidate",
                "position": 1604,
              },
              {
                "name": "handle",
                "position": 1666,
              },
              {
                "name": "default",
                "position": 1768,
              },
              {
                "name": "findCurrentEntry",
                "position": 1917,
              },
              {
                "name": "CaptionEntryComponent",
                "position": 15143,
              },
              {
                "name": "partitionRanges",
                "position": 19387,
              },
            ],
            "namedImports": [
              {
                "name": "Transition",
                "position": 9,
                "source": "@headlessui/react",
              },
              {
                "name": "groupBy",
                "position": 57,
                "source": "@hiogawa/utils",
              },
              {
                "name": "isNil",
                "position": 66,
                "source": "@hiogawa/utils",
              },
              {
                "name": "sortBy",
                "position": 73,
                "source": "@hiogawa/utils",
              },
              {
                "name": "uniq",
                "position": 81,
                "source": "@hiogawa/utils",
              },
              {
                "name": "zip",
                "position": 87,
                "source": "@hiogawa/utils",
              },
              {
                "name": "toArraySetState",
                "position": 125,
                "source": "@hiogawa/utils-react",
              },
              {
                "name": "useRafLoop",
                "position": 142,
                "source": "@hiogawa/utils-react",
              },
              {
                "name": "Link",
                "position": 193,
                "source": "@remix-run/react",
              },
              {
                "name": "useNavigate",
                "position": 199,
                "source": "@remix-run/react",
              },
              {
                "name": "useMutation",
                "position": 247,
                "source": "@tanstack/react-query",
              },
              {
                "name": "useQuery",
                "position": 260,
                "source": "@tanstack/react-query",
              },
              {
                "name": "useQueryClient",
                "position": 270,
                "source": "@tanstack/react-query",
              },
              {
                "name": "VirtualItem",
                "position": 328,
                "source": "@tanstack/react-virtual",
              },
              {
                "name": "Virtualizer",
                "position": 343,
                "source": "@tanstack/react-virtual",
              },
              {
                "name": "useVirtualizer",
                "position": 358,
                "source": "@tanstack/react-virtual",
              },
              {
                "name": "atom",
                "position": 417,
                "source": "jotai",
              },
              {
                "name": "useAtom",
                "position": 423,
                "source": "jotai",
              },
              {
                "name": "atomWithStorage",
                "position": 456,
                "source": "jotai/utils",
              },
              {
                "name": "default",
                "position": 501,
                "source": "react",
              },
              {
                "name": "default",
                "position": 528,
                "source": "react-hot-toast",
              },
              {
                "name": "z",
                "position": 567,
                "source": "zod",
              },
              {
                "name": "SelectWrapper",
                "position": 592,
                "source": "fixtures/ytsub-v3/app/components/misc",
              },
              {
                "name": "transitionProps",
                "position": 607,
                "source": "fixtures/ytsub-v3/app/components/misc",
              },
              {
                "name": "useModal",
                "position": 664,
                "source": "fixtures/ytsub-v3/app/components/modal",
              },
              {
                "name": "PopoverSimple",
                "position": 715,
                "source": "fixtures/ytsub-v3/app/components/popover",
              },
              {
                "name": "TT",
                "position": 778,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "UserTable",
                "position": 836,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "$R",
                "position": 881,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "ROUTE_DEF",
                "position": 885,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "rpcClientQuery",
                "position": 932,
                "source": "fixtures/ytsub-v3/app/trpc/client",
              },
              {
                "name": "useDocumentEvent",
                "position": 984,
                "source": "fixtures/ytsub-v3/app/utils/hooks-client-utils",
              },
              {
                "name": "intl",
                "position": 1051,
                "source": "fixtures/ytsub-v3/app/utils/intl",
              },
              {
                "name": "disableUrlQueryRevalidation",
                "position": 1094,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "useLeafLoaderData",
                "position": 1125,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "useLoaderDataExtra",
                "position": 1146,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "useTypedUrlQuery",
                "position": 1168,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "cls",
                "position": 1230,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "none",
                "position": 1235,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "PageHandle",
                "position": 1281,
                "source": "fixtures/ytsub-v3/app/utils/page-handle",
              },
              {
                "name": "CaptionEntry",
                "position": 1340,
                "source": "fixtures/ytsub-v3/app/utils/types",
              },
              {
                "name": "YoutubePlayer",
                "position": 1392,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "YoutubePlayerOptions",
                "position": 1409,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "stringifyTimestamp",
                "position": 1433,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "usePlayerLoader",
                "position": 1455,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "LoaderData",
                "position": 1517,
                "source": "fixtures/ytsub-v3/app/routes/videos/$id.server",
              },
            ],
            "namedReExports": [
              {
                "name": "loader",
                "nameBefore": undefined,
                "position": 1560,
                "source": "fixtures/ytsub-v3/app/routes/videos/$id.server",
              },
            ],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/videos/index.server.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "getVideosLoaderData",
                "position": 493,
              },
              {
                "name": "loader",
                "position": 946,
              },
            ],
            "namedImports": [
              {
                "name": "E",
                "position": 11,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "T",
                "position": 16,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "TT",
                "position": 21,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "db",
                "position": 27,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "toPaginationResult",
                "position": 33,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "ctx_get",
                "position": 103,
                "source": "fixtures/ytsub-v3/app/server/request-context/storage",
              },
              {
                "name": "ctx_requireUserOrRedirect",
                "position": 169,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
              {
                "name": "wrapLoader",
                "position": 198,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
              {
                "name": "PAGINATION_PARAMS_SCHEMA",
                "position": 263,
                "source": "fixtures/ytsub-v3/app/utils/pagination",
              },
              {
                "name": "PaginationMetadata",
                "position": 291,
                "source": "fixtures/ytsub-v3/app/utils/pagination",
              },
              {
                "name": "PaginationParams",
                "position": 313,
                "source": "fixtures/ytsub-v3/app/utils/pagination",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/videos/index.test.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [
              {
                "name": "tinyassert",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "describe",
                "position": 54,
                "source": "vitest",
              },
              {
                "name": "expect",
                "position": 64,
                "source": "vitest",
              },
              {
                "name": "it",
                "position": 72,
                "source": "vitest",
              },
              {
                "name": "z",
                "position": 101,
                "source": "zod",
              },
              {
                "name": "testLoader",
                "position": 126,
                "source": "fixtures/ytsub-v3/app/misc/test-helper",
              },
              {
                "name": "useUserVideo",
                "position": 138,
                "source": "fixtures/ytsub-v3/app/misc/test-helper",
              },
              {
                "name": "zSnapshotType",
                "position": 193,
                "source": "fixtures/ytsub-v3/app/misc/test-helper-snapshot",
              },
              {
                "name": "mockRequestContext",
                "position": 258,
                "source": "fixtures/ytsub-v3/app/server/request-context/mock",
              },
              {
                "name": "JSON_EXTRA",
                "position": 330,
                "source": "fixtures/ytsub-v3/app/utils/json-extra",
              },
              {
                "name": "loader",
                "position": 383,
                "source": "fixtures/ytsub-v3/app/routes/videos/index",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/videos/index.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "handle",
                "position": 964,
              },
              {
                "name": "default",
                "position": 1027,
              },
              {
                "name": "VideoListComponent",
                "position": 1206,
              },
            ],
            "namedImports": [
              {
                "name": "Transition",
                "position": 9,
                "source": "@headlessui/react",
              },
              {
                "name": "useNavigate",
                "position": 57,
                "source": "@remix-run/react",
              },
              {
                "name": "useMutation",
                "position": 105,
                "source": "@tanstack/react-query",
              },
              {
                "name": "useQuery",
                "position": 118,
                "source": "@tanstack/react-query",
              },
              {
                "name": "default",
                "position": 166,
                "source": "react-hot-toast",
              },
              {
                "name": "PaginationComponent",
                "position": 207,
                "source": "fixtures/ytsub-v3/app/components/misc",
              },
              {
                "name": "VideoComponent",
                "position": 230,
                "source": "fixtures/ytsub-v3/app/components/misc",
              },
              {
                "name": "transitionProps",
                "position": 248,
                "source": "fixtures/ytsub-v3/app/components/misc",
              },
              {
                "name": "useModal",
                "position": 306,
                "source": "fixtures/ytsub-v3/app/components/modal",
              },
              {
                "name": "DeckTable",
                "position": 362,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "UserTable",
                "position": 373,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "VideoTable",
                "position": 384,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "R",
                "position": 430,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "rpcClientQuery",
                "position": 469,
                "source": "fixtures/ytsub-v3/app/trpc/client",
              },
              {
                "name": "useLoaderDataExtra",
                "position": 521,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "PageHandle",
                "position": 589,
                "source": "fixtures/ytsub-v3/app/utils/page-handle",
              },
              {
                "name": "toastInfo",
                "position": 643,
                "source": "fixtures/ytsub-v3/app/utils/toast-utils",
              },
              {
                "name": "VideosLoaderData",
                "position": 908,
                "source": "fixtures/ytsub-v3/app/routes/videos/index.server",
              },
            ],
            "namedReExports": [
              {
                "name": "loader",
                "nameBefore": undefined,
                "position": 862,
                "source": "fixtures/ytsub-v3/app/routes/videos/index.server",
              },
            ],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/videos/new.server.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "loader",
                "position": 909,
              },
            ],
            "namedImports": [
              {
                "name": "wrapErrorAsync",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "redirect",
                "position": 58,
                "source": "@remix-run/server-runtime",
              },
              {
                "name": "UserTable",
                "position": 117,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "R",
                "position": 162,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "ROUTE_DEF",
                "position": 165,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "ctx_currentUser",
                "position": 212,
                "source": "fixtures/ytsub-v3/app/server/request-context/session",
              },
              {
                "name": "ctx_get",
                "position": 284,
                "source": "fixtures/ytsub-v3/app/server/request-context/storage",
              },
              {
                "name": "ctx_setFlashMessage",
                "position": 348,
                "source": "fixtures/ytsub-v3/app/utils/flash-message.server",
              },
              {
                "name": "isLanguageCode",
                "position": 420,
                "source": "fixtures/ytsub-v3/app/utils/language",
              },
              {
                "name": "assertOrRespond",
                "position": 477,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
              {
                "name": "unwrapZodResultOrRespond",
                "position": 496,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
              {
                "name": "wrapLoader",
                "position": 524,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils.server",
              },
              {
                "name": "CaptionConfig",
                "position": 592,
                "source": "fixtures/ytsub-v3/app/utils/types",
              },
              {
                "name": "VideoMetadata",
                "position": 607,
                "source": "fixtures/ytsub-v3/app/utils/types",
              },
              {
                "name": "fetchVideoMetadata",
                "position": 660,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "findCaptionConfigPair",
                "position": 682,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "parseVideoId",
                "position": 707,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/routes/videos/new.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "handle",
                "position": 1077,
              },
              {
                "name": "default",
                "position": 1190,
              },
            ],
            "namedImports": [
              {
                "name": "tinyassert",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "useNavigate",
                "position": 54,
                "source": "@remix-run/react",
              },
              {
                "name": "useMutation",
                "position": 102,
                "source": "@tanstack/react-query",
              },
              {
                "name": "atom",
                "position": 155,
                "source": "jotai",
              },
              {
                "name": "useAtom",
                "position": 161,
                "source": "jotai",
              },
              {
                "name": "useForm",
                "position": 194,
                "source": "react-hook-form",
              },
              {
                "name": "toast",
                "position": 237,
                "source": "react-hot-toast",
              },
              {
                "name": "SelectWrapper",
                "position": 278,
                "source": "fixtures/ytsub-v3/app/components/misc",
              },
              {
                "name": "PopoverSimple",
                "position": 333,
                "source": "fixtures/ytsub-v3/app/components/popover",
              },
              {
                "name": "$R",
                "position": 391,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "rpcClient",
                "position": 431,
                "source": "fixtures/ytsub-v3/app/trpc/client",
              },
              {
                "name": "rpcClientQuery",
                "position": 442,
                "source": "fixtures/ytsub-v3/app/trpc/client",
              },
              {
                "name": "FILTERED_LANGUAGE_CODES",
                "position": 496,
                "source": "fixtures/ytsub-v3/app/utils/language",
              },
              {
                "name": "LanguageCode",
                "position": 523,
                "source": "fixtures/ytsub-v3/app/utils/language",
              },
              {
                "name": "languageCodeToName",
                "position": 539,
                "source": "fixtures/ytsub-v3/app/utils/language",
              },
              {
                "name": "useLoaderDataExtra",
                "position": 599,
                "source": "fixtures/ytsub-v3/app/utils/loader-utils",
              },
              {
                "name": "cls",
                "position": 662,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "PageHandle",
                "position": 707,
                "source": "fixtures/ytsub-v3/app/utils/page-handle",
              },
              {
                "name": "toastInfo",
                "position": 761,
                "source": "fixtures/ytsub-v3/app/utils/toast-utils",
              },
              {
                "name": "CaptionConfig",
                "position": 819,
                "source": "fixtures/ytsub-v3/app/utils/types",
              },
              {
                "name": "VideoMetadata",
                "position": 834,
                "source": "fixtures/ytsub-v3/app/utils/types",
              },
              {
                "name": "encodeAdvancedModeLanguageCode",
                "position": 887,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "toCaptionConfigOptions",
                "position": 921,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "LoaderData",
                "position": 990,
                "source": "fixtures/ytsub-v3/app/routes/videos/new.server",
              },
            ],
            "namedReExports": [
              {
                "name": "loader",
                "nameBefore": undefined,
                "position": 1033,
                "source": "fixtures/ytsub-v3/app/routes/videos/new.server",
              },
            ],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/server/document.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "renderToDocument",
                "position": 311,
              },
            ],
            "namedImports": [
              {
                "name": "generateThemeScript",
                "position": 9,
                "source": "@hiogawa/theme-script",
              },
              {
                "name": "injectPublicConfigScript",
                "position": 70,
                "source": "fixtures/ytsub-v3/app/utils/config-public",
              },
              {
                "name": "publicConfig",
                "position": 96,
                "source": "fixtures/ytsub-v3/app/utils/config-public",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/server/request-context/index.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "requestContextHandler",
                "position": 225,
              },
            ],
            "namedImports": [
              {
                "name": "routeParamsContextHandler",
                "position": 9,
                "source": "fixtures/ytsub-v3/app/server/request-context/loader",
              },
              {
                "name": "responseHeadersContextHandler",
                "position": 63,
                "source": "fixtures/ytsub-v3/app/server/request-context/response-headers",
              },
              {
                "name": "sessionHandler",
                "position": 131,
                "source": "fixtures/ytsub-v3/app/server/request-context/session",
              },
              {
                "name": "requestContextStorageHandler",
                "position": 175,
                "source": "fixtures/ytsub-v3/app/server/request-context/storage",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/server/request-context/loader.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "routeParamsContextHandler",
                "position": 292,
              },
            ],
            "namedImports": [
              {
                "name": "RequestHandler",
                "position": 14,
                "source": "@hattip/compose",
              },
              {
                "name": "Params",
                "position": 64,
                "source": "@remix-run/react",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/server/request-context/mock.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "mockRequestContext",
                "position": 249,
              },
            ],
            "namedImports": [
              {
                "name": "RequestContext",
                "position": 9,
                "source": "@hattip/compose",
              },
              {
                "name": "composePartial",
                "position": 25,
                "source": "@hattip/compose",
              },
              {
                "name": "requestContextHandler",
                "position": 75,
                "source": "fixtures/ytsub-v3/app/server/request-context",
              },
              {
                "name": "TT",
                "position": 118,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "writeCookieSession",
                "position": 171,
                "source": "fixtures/ytsub-v3/app/server/request-context/session",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/server/request-context/response-headers.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "responseHeadersContextHandler",
                "position": 305,
              },
              {
                "name": "ctx_cacheResponse",
                "position": 577,
              },
            ],
            "namedImports": [
              {
                "name": "RequestHandler",
                "position": 14,
                "source": "@hattip/compose",
              },
              {
                "name": "ctx_get",
                "position": 64,
                "source": "fixtures/ytsub-v3/app/server/request-context/storage",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/server/request-context/session.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "sessionHandler",
                "position": 820,
              },
              {
                "name": "ctx_commitSession",
                "position": 1057,
              },
              {
                "name": "ctx_currentUser",
                "position": 1224,
              },
              {
                "name": "ctx_requireUser",
                "position": 1366,
              },
              {
                "name": "ctx_requireSignout",
                "position": 1541,
              },
              {
                "name": "writeCookieSession",
                "position": 2643,
              },
            ],
            "namedImports": [
              {
                "name": "RequestHandler",
                "position": 9,
                "source": "@hattip/compose",
              },
              {
                "name": "checkExpirationTime",
                "position": 61,
                "source": "@hiogawa/tiny-jwt",
              },
              {
                "name": "jwsSign",
                "position": 84,
                "source": "@hiogawa/tiny-jwt",
              },
              {
                "name": "jwsVerify",
                "position": 95,
                "source": "@hiogawa/tiny-jwt",
              },
              {
                "name": "setExpirationTime",
                "position": 108,
                "source": "@hiogawa/tiny-jwt",
              },
              {
                "name": "tinyassert",
                "position": 164,
                "source": "@hiogawa/utils",
              },
              {
                "name": "wrapErrorAsync",
                "position": 176,
                "source": "@hiogawa/utils",
              },
              {
                "name": "z",
                "position": 262,
                "source": "zod",
              },
              {
                "name": "findUserById",
                "position": 287,
                "source": "fixtures/ytsub-v3/app/utils/auth",
              },
              {
                "name": "serverConfig",
                "position": 336,
                "source": "fixtures/ytsub-v3/app/utils/config",
              },
              {
                "name": "ctx_get",
                "position": 387,
                "source": "fixtures/ytsub-v3/app/server/request-context/storage",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [
              {
                "position": 223,
                "source": "cookie",
              },
            ],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/server/request-context/storage.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "requestContextStorageHandler",
                "position": 511,
              },
              {
                "name": "ctx_get",
                "position": 719,
              },
            ],
            "namedImports": [
              {
                "name": "AsyncLocalStorage",
                "position": 9,
                "source": "node:async_hooks",
              },
              {
                "name": "RequestContext",
                "position": 68,
                "source": "@hattip/compose",
              },
              {
                "name": "RequestHandler",
                "position": 84,
                "source": "@hattip/compose",
              },
              {
                "name": "tinyassert",
                "position": 134,
                "source": "@hiogawa/utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/trpc/client.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "RPC_ENDPOINT",
                "position": 241,
              },
              {
                "name": "RPC_GET_PATHS",
                "position": 277,
              },
              {
                "name": "rpcClient",
                "position": 370,
              },
              {
                "name": "rpcClientQuery",
                "position": 575,
              },
            ],
            "namedImports": [
              {
                "name": "createFnRecordQueryProxy",
                "position": 9,
                "source": "@hiogawa/query-proxy",
              },
              {
                "name": "httpClientAdapter",
                "position": 74,
                "source": "@hiogawa/tiny-rpc",
              },
              {
                "name": "proxyTinyRpc",
                "position": 93,
                "source": "@hiogawa/tiny-rpc",
              },
              {
                "name": "JSON_EXTRA",
                "position": 143,
                "source": "fixtures/ytsub-v3/app/utils/json-extra",
              },
              {
                "name": "rpcRoutes",
                "position": 193,
                "source": "fixtures/ytsub-v3/app/trpc/server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/trpc/routes/bookmarks.test.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [
              {
                "name": "objectPick",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "beforeAll",
                "position": 54,
                "source": "vitest",
              },
              {
                "name": "describe",
                "position": 65,
                "source": "vitest",
              },
              {
                "name": "expect",
                "position": 75,
                "source": "vitest",
              },
              {
                "name": "it",
                "position": 83,
                "source": "vitest",
              },
              {
                "name": "E",
                "position": 112,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "T",
                "position": 115,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "db",
                "position": 118,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "importSeed",
                "position": 171,
                "source": "fixtures/ytsub-v3/app/misc/seed-utils",
              },
              {
                "name": "useUser",
                "position": 223,
                "source": "fixtures/ytsub-v3/app/misc/test-helper",
              },
              {
                "name": "useUserVideo",
                "position": 232,
                "source": "fixtures/ytsub-v3/app/misc/test-helper",
              },
              {
                "name": "mockRequestContext",
                "position": 287,
                "source": "fixtures/ytsub-v3/app/server/request-context/mock",
              },
              {
                "name": "rpcRoutes",
                "position": 359,
                "source": "fixtures/ytsub-v3/app/trpc/server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/trpc/routes/bookmarks.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "rpcRoutesBookmarks",
                "position": 477,
              },
            ],
            "namedImports": [
              {
                "name": "validateFn",
                "position": 9,
                "source": "@hiogawa/tiny-rpc",
              },
              {
                "name": "mapOption",
                "position": 57,
                "source": "@hiogawa/utils",
              },
              {
                "name": "tinyassert",
                "position": 68,
                "source": "@hiogawa/utils",
              },
              {
                "name": "sql",
                "position": 113,
                "source": "drizzle-orm",
              },
              {
                "name": "z",
                "position": 148,
                "source": "zod",
              },
              {
                "name": "E",
                "position": 173,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "T",
                "position": 176,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "db",
                "position": 179,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "limitOne",
                "position": 183,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "selectOne",
                "position": 193,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "Z_DATE_RANGE_TYPE",
                "position": 253,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "ctx_requireUser",
                "position": 308,
                "source": "fixtures/ytsub-v3/app/server/request-context/session",
              },
              {
                "name": "fromTemporal",
                "position": 382,
                "source": "fixtures/ytsub-v3/app/utils/temporal-utils",
              },
              {
                "name": "getZonedDateRange",
                "position": 398,
                "source": "fixtures/ytsub-v3/app/utils/temporal-utils",
              },
              {
                "name": "toZdt",
                "position": 419,
                "source": "fixtures/ytsub-v3/app/utils/temporal-utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/trpc/routes/decks.test.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [
              {
                "name": "beforeAll",
                "position": 9,
                "source": "vitest",
              },
              {
                "name": "describe",
                "position": 20,
                "source": "vitest",
              },
              {
                "name": "expect",
                "position": 30,
                "source": "vitest",
              },
              {
                "name": "it",
                "position": 38,
                "source": "vitest",
              },
              {
                "name": "importSeed",
                "position": 67,
                "source": "fixtures/ytsub-v3/app/misc/seed-utils",
              },
              {
                "name": "useUser",
                "position": 119,
                "source": "fixtures/ytsub-v3/app/misc/test-helper",
              },
              {
                "name": "mockRequestContext",
                "position": 169,
                "source": "fixtures/ytsub-v3/app/server/request-context/mock",
              },
              {
                "name": "rpcRoutes",
                "position": 241,
                "source": "fixtures/ytsub-v3/app/trpc/server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/trpc/routes/decks.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "rpcRoutesDecks",
                "position": 867,
              },
              {
                "name": "getUserDeckPracticeStatistics",
                "position": 10293,
              },
            ],
            "namedImports": [
              {
                "name": "validateFn",
                "position": 9,
                "source": "@hiogawa/tiny-rpc",
              },
              {
                "name": "mapOption",
                "position": 57,
                "source": "@hiogawa/utils",
              },
              {
                "name": "tinyassert",
                "position": 68,
                "source": "@hiogawa/utils",
              },
              {
                "name": "sql",
                "position": 113,
                "source": "drizzle-orm",
              },
              {
                "name": "z",
                "position": 148,
                "source": "zod",
              },
              {
                "name": "PRACTICE_HISTORY_DATASET_KEYS",
                "position": 175,
                "source": "fixtures/ytsub-v3/app/components/practice-history-chart",
              },
              {
                "name": "PracticeHistoryChartDataEntry",
                "position": 208,
                "source": "fixtures/ytsub-v3/app/components/practice-history-chart",
              },
              {
                "name": "E",
                "position": 300,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "T",
                "position": 305,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "TT",
                "position": 310,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "db",
                "position": 316,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "limitOne",
                "position": 322,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "selectOne",
                "position": 334,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "DEFAULT_DECK_CACHE",
                "position": 395,
                "source": "fixtures/ytsub-v3/app/db/types",
              },
              {
                "name": "Z_PRACTICE_ACTION_TYPES",
                "position": 415,
                "source": "fixtures/ytsub-v3/app/db/types",
              },
              {
                "name": "Z_DATE_RANGE_TYPE",
                "position": 473,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "importDeckJson",
                "position": 528,
                "source": "fixtures/ytsub-v3/app/misc/seed-utils",
              },
              {
                "name": "ctx_requireUser",
                "position": 584,
                "source": "fixtures/ytsub-v3/app/server/request-context/session",
              },
              {
                "name": "PracticeSystem",
                "position": 658,
                "source": "fixtures/ytsub-v3/app/utils/practice-system",
              },
              {
                "name": "getDailyPracticeStatistics",
                "position": 676,
                "source": "fixtures/ytsub-v3/app/utils/practice-system",
              },
              {
                "name": "updateDeckCache",
                "position": 706,
                "source": "fixtures/ytsub-v3/app/utils/practice-system",
              },
              {
                "name": "fromTemporal",
                "position": 772,
                "source": "fixtures/ytsub-v3/app/utils/temporal-utils",
              },
              {
                "name": "getZonedDateRange",
                "position": 788,
                "source": "fixtures/ytsub-v3/app/utils/temporal-utils",
              },
              {
                "name": "toZdt",
                "position": 809,
                "source": "fixtures/ytsub-v3/app/utils/temporal-utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/trpc/routes/users.test.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [
              {
                "name": "tinyassert",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "beforeEach",
                "position": 54,
                "source": "vitest",
              },
              {
                "name": "describe",
                "position": 66,
                "source": "vitest",
              },
              {
                "name": "expect",
                "position": 76,
                "source": "vitest",
              },
              {
                "name": "it",
                "position": 84,
                "source": "vitest",
              },
              {
                "name": "z",
                "position": 113,
                "source": "zod",
              },
              {
                "name": "E",
                "position": 138,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "T",
                "position": 141,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "db",
                "position": 144,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "useUser",
                "position": 197,
                "source": "fixtures/ytsub-v3/app/misc/test-helper",
              },
              {
                "name": "zSnapshotType",
                "position": 247,
                "source": "fixtures/ytsub-v3/app/misc/test-helper-snapshot",
              },
              {
                "name": "mockRequestContext",
                "position": 312,
                "source": "fixtures/ytsub-v3/app/server/request-context/mock",
              },
              {
                "name": "ctx_get",
                "position": 384,
                "source": "fixtures/ytsub-v3/app/server/request-context/storage",
              },
              {
                "name": "findByUsername",
                "position": 448,
                "source": "fixtures/ytsub-v3/app/utils/auth",
              },
              {
                "name": "rpcRoutes",
                "position": 499,
                "source": "fixtures/ytsub-v3/app/trpc/server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/trpc/routes/users.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "rpcRoutesUsers",
                "position": 924,
              },
              {
                "name": "updateEmailByCode",
                "position": 5596,
              },
            ],
            "namedImports": [
              {
                "name": "default",
                "position": 7,
                "source": "crypto",
              },
              {
                "name": "validateFn",
                "position": 38,
                "source": "@hiogawa/tiny-rpc",
              },
              {
                "name": "tinyassert",
                "position": 86,
                "source": "@hiogawa/utils",
              },
              {
                "name": "default",
                "position": 129,
                "source": "showdown",
              },
              {
                "name": "z",
                "position": 164,
                "source": "zod",
              },
              {
                "name": "E",
                "position": 189,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "T",
                "position": 192,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "db",
                "position": 195,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "selectOne",
                "position": 199,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "$R",
                "position": 259,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "ctx_commitSession",
                "position": 301,
                "source": "fixtures/ytsub-v3/app/server/request-context/session",
              },
              {
                "name": "ctx_requireSignout",
                "position": 322,
                "source": "fixtures/ytsub-v3/app/server/request-context/session",
              },
              {
                "name": "ctx_requireUser",
                "position": 344,
                "source": "fixtures/ytsub-v3/app/server/request-context/session",
              },
              {
                "name": "ctx_get",
                "position": 417,
                "source": "fixtures/ytsub-v3/app/server/request-context/storage",
              },
              {
                "name": "findByUsername",
                "position": 481,
                "source": "fixtures/ytsub-v3/app/utils/auth",
              },
              {
                "name": "register",
                "position": 497,
                "source": "fixtures/ytsub-v3/app/utils/auth",
              },
              {
                "name": "verifySignin",
                "position": 507,
                "source": "fixtures/ytsub-v3/app/utils/auth",
              },
              {
                "name": "Z_PASSWORD",
                "position": 556,
                "source": "fixtures/ytsub-v3/app/utils/auth-common",
              },
              {
                "name": "Z_USERNAME",
                "position": 568,
                "source": "fixtures/ytsub-v3/app/utils/auth-common",
              },
              {
                "name": "serverConfig",
                "position": 622,
                "source": "fixtures/ytsub-v3/app/utils/config",
              },
              {
                "name": "sendEmail",
                "position": 673,
                "source": "fixtures/ytsub-v3/app/utils/email-utils",
              },
              {
                "name": "toPasswordHash",
                "position": 726,
                "source": "fixtures/ytsub-v3/app/utils/password-utils",
              },
              {
                "name": "isValidTimezone",
                "position": 787,
                "source": "fixtures/ytsub-v3/app/utils/temporal-utils",
              },
              {
                "name": "verifyTurnstile",
                "position": 849,
                "source": "fixtures/ytsub-v3/app/utils/turnstile-utils.server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/trpc/routes/videos.test.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [
              {
                "name": "describe",
                "position": 9,
                "source": "vitest",
              },
              {
                "name": "expect",
                "position": 19,
                "source": "vitest",
              },
              {
                "name": "it",
                "position": 27,
                "source": "vitest",
              },
              {
                "name": "E",
                "position": 56,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "T",
                "position": 59,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "selectMany",
                "position": 62,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "useUserVideo",
                "position": 123,
                "source": "fixtures/ytsub-v3/app/misc/test-helper",
              },
              {
                "name": "mockRequestContext",
                "position": 178,
                "source": "fixtures/ytsub-v3/app/server/request-context/mock",
              },
              {
                "name": "rpcRoutes",
                "position": 250,
                "source": "fixtures/ytsub-v3/app/trpc/server",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/trpc/routes/videos.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "rpcRoutesVideos",
                "position": 641,
              },
            ],
            "namedImports": [
              {
                "name": "validateFn",
                "position": 9,
                "source": "@hiogawa/tiny-rpc",
              },
              {
                "name": "tinyassert",
                "position": 57,
                "source": "@hiogawa/utils",
              },
              {
                "name": "z",
                "position": 102,
                "source": "zod",
              },
              {
                "name": "E",
                "position": 127,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "T",
                "position": 130,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "db",
                "position": 133,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "limitOne",
                "position": 137,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "selectOne",
                "position": 147,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "filterNewVideo",
                "position": 207,
                "source": "fixtures/ytsub-v3/app/db/helper",
              },
              {
                "name": "insertVideoAndCaptionEntries",
                "position": 223,
                "source": "fixtures/ytsub-v3/app/db/helper",
              },
              {
                "name": "ctx_cacheResponse",
                "position": 287,
                "source": "fixtures/ytsub-v3/app/server/request-context/response-headers",
              },
              {
                "name": "ctx_currentUser",
                "position": 372,
                "source": "fixtures/ytsub-v3/app/server/request-context/session",
              },
              {
                "name": "ctx_requireUser",
                "position": 391,
                "source": "fixtures/ytsub-v3/app/server/request-context/session",
              },
              {
                "name": "Z_CAPTION_ENTRY",
                "position": 464,
                "source": "fixtures/ytsub-v3/app/utils/types",
              },
              {
                "name": "Z_NEW_VIDEO",
                "position": 519,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "fetchCaptionEntries",
                "position": 534,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "fetchTtmlEntries",
                "position": 557,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "fetchVideoMetadata",
                "position": 577,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/trpc/server.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "rpcRoutes",
                "position": 528,
              },
              {
                "name": "rpcHandler",
                "position": 709,
              },
            ],
            "namedImports": [
              {
                "name": "RequestHandler",
                "position": 9,
                "source": "@hattip/compose",
              },
              {
                "name": "TinyRpcRoutes",
                "position": 61,
                "source": "@hiogawa/tiny-rpc",
              },
              {
                "name": "exposeTinyRpc",
                "position": 78,
                "source": "@hiogawa/tiny-rpc",
              },
              {
                "name": "httpServerAdapter",
                "position": 95,
                "source": "@hiogawa/tiny-rpc",
              },
              {
                "name": "SpanStatusCode",
                "position": 151,
                "source": "@opentelemetry/api",
              },
              {
                "name": "trace",
                "position": 167,
                "source": "@opentelemetry/api",
              },
              {
                "name": "JSON_EXTRA",
                "position": 211,
                "source": "fixtures/ytsub-v3/app/utils/json-extra",
              },
              {
                "name": "RPC_ENDPOINT",
                "position": 261,
                "source": "fixtures/ytsub-v3/app/trpc/client",
              },
              {
                "name": "RPC_GET_PATHS",
                "position": 275,
                "source": "fixtures/ytsub-v3/app/trpc/client",
              },
              {
                "name": "rpcRoutesBookmarks",
                "position": 317,
                "source": "fixtures/ytsub-v3/app/trpc/routes/bookmarks",
              },
              {
                "name": "rpcRoutesDecks",
                "position": 374,
                "source": "fixtures/ytsub-v3/app/trpc/routes/decks",
              },
              {
                "name": "rpcRoutesUsers",
                "position": 423,
                "source": "fixtures/ytsub-v3/app/trpc/routes/users",
              },
              {
                "name": "rpcRoutesVideos",
                "position": 472,
                "source": "fixtures/ytsub-v3/app/trpc/routes/videos",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/auth-common.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "Z_USERNAME",
                "position": 39,
              },
              {
                "name": "Z_PASSWORD",
                "position": 203,
              },
            ],
            "namedImports": [
              {
                "name": "z",
                "position": 9,
                "source": "zod",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/auth.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "register",
                "position": 290,
              },
              {
                "name": "findByUsername",
                "position": 939,
              },
              {
                "name": "findUserById",
                "position": 1098,
              },
              {
                "name": "verifySignin",
                "position": 1195,
              },
            ],
            "namedImports": [
              {
                "name": "tinyassert",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "E",
                "position": 54,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "T",
                "position": 57,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "db",
                "position": 60,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "selectOne",
                "position": 64,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "UserTable",
                "position": 126,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "toPasswordHash",
                "position": 170,
                "source": "fixtures/ytsub-v3/app/utils/password-utils",
              },
              {
                "name": "verifyPassword",
                "position": 188,
                "source": "fixtures/ytsub-v3/app/utils/password-utils",
              },
              {
                "name": "verifyPasswordNoop",
                "position": 206,
                "source": "fixtures/ytsub-v3/app/utils/password-utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/caption-editor-utils.test.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [
              {
                "name": "describe",
                "position": 9,
                "source": "vitest",
              },
              {
                "name": "expect",
                "position": 19,
                "source": "vitest",
              },
              {
                "name": "it",
                "position": 27,
                "source": "vitest",
              },
              {
                "name": "scrapeColorCodedLyrics",
                "position": 56,
                "source": "fixtures/ytsub-v3/app/utils/caption-editor-utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/caption-editor-utils.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "scrapeColorCodedLyrics",
                "position": 98,
              },
            ],
            "namedImports": [
              {
                "name": "tinyassert",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "Window",
                "position": 54,
                "source": "happy-dom",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/config-public.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "publicConfig",
                "position": 240,
              },
              {
                "name": "initializePublicConfigServer",
                "position": 287,
              },
              {
                "name": "initializePublicConfigClient",
                "position": 374,
              },
              {
                "name": "injectPublicConfigScript",
                "position": 479,
              },
            ],
            "namedImports": [
              {
                "name": "PublicConfig",
                "position": 14,
                "source": "fixtures/ytsub-v3/app/utils/config",
              },
              {
                "name": "uninitialized",
                "position": 55,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/config.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "serverConfig",
                "position": 1421,
              },
              {
                "name": "initializeConfigServer",
                "position": 1487,
              },
            ],
            "namedImports": [
              {
                "name": "z",
                "position": 45,
                "source": "zod",
              },
              {
                "name": "initializePublicConfigServer",
                "position": 70,
                "source": "fixtures/ytsub-v3/app/utils/config-public",
              },
              {
                "name": "uninitialized",
                "position": 134,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [
              {
                "position": 7,
                "source": "process",
              },
            ],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/current-user.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "useCurrentUser",
                "position": 417,
              },
              {
                "name": "useSetCurrentUser",
                "position": 659,
              },
              {
                "name": "useHydrateCurrentUser",
                "position": 1013,
              },
            ],
            "namedImports": [
              {
                "name": "useQuery",
                "position": 9,
                "source": "@tanstack/react-query",
              },
              {
                "name": "useQueryClient",
                "position": 19,
                "source": "@tanstack/react-query",
              },
              {
                "name": "default",
                "position": 73,
                "source": "react",
              },
              {
                "name": "TT",
                "position": 102,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "none",
                "position": 152,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/dom-utils.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "loadScript",
                "position": 59,
              },
            ],
            "namedImports": [
              {
                "name": "newPromiseWithResolvers",
                "position": 9,
                "source": "@hiogawa/utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/email-utils.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "debugEmails",
                "position": 425,
              },
              {
                "name": "sendEmail",
                "position": 519,
              },
            ],
            "namedImports": [
              {
                "name": "tinyassert",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "SendEmailV3_1",
                "position": 59,
                "source": "node-mailjet",
              },
              {
                "name": "z",
                "position": 105,
                "source": "zod",
              },
              {
                "name": "serverConfig",
                "position": 130,
                "source": "fixtures/ytsub-v3/app/utils/config",
              },
              {
                "name": "wrapTraceAsyncSimple",
                "position": 171,
                "source": "fixtures/ytsub-v3/app/utils/opentelemetry-utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/flash-message.server.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "ctx_setFlashMessage",
                "position": 186,
              },
            ],
            "namedImports": [
              {
                "name": "ctx_get",
                "position": 9,
                "source": "fixtures/ytsub-v3/app/server/request-context/storage",
              },
              {
                "name": "FlashMessage",
                "position": 70,
                "source": "fixtures/ytsub-v3/app/utils/flash-message",
              },
              {
                "name": "serializeFlashMessageCookie",
                "position": 84,
                "source": "fixtures/ytsub-v3/app/utils/flash-message",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/flash-message.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "useFlashMessageHandler",
                "position": 637,
              },
              {
                "name": "handleFlashMessage",
                "position": 801,
              },
              {
                "name": "serializeFlashMessageCookie",
                "position": 1509,
              },
            ],
            "namedImports": [
              {
                "name": "wrapError",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "useNavigation",
                "position": 53,
                "source": "@remix-run/react",
              },
              {
                "name": "toast",
                "position": 140,
                "source": "react-hot-toast",
              },
              {
                "name": "z",
                "position": 181,
                "source": "zod",
              },
              {
                "name": "useEffectNoStrict",
                "position": 206,
                "source": "fixtures/ytsub-v3/app/utils/misc-react",
              },
              {
                "name": "toastInfo",
                "position": 256,
                "source": "fixtures/ytsub-v3/app/utils/toast-utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [
              {
                "position": 101,
                "source": "cookie",
              },
            ],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/hooks-client-utils.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "useDocumentEvent",
                "position": 349,
              },
              {
                "name": "useClickOutside",
                "position": 603,
              },
              {
                "name": "useIntersectionObserver",
                "position": 937,
              },
              {
                "name": "useMatchMedia",
                "position": 1304,
              },
            ],
            "namedImports": [
              {
                "name": "useRefCallbackEffect",
                "position": 9,
                "source": "@hiogawa/utils-react",
              },
              {
                "name": "useStableCallback",
                "position": 31,
                "source": "@hiogawa/utils-react",
              },
              {
                "name": "default",
                "position": 87,
                "source": "react",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/intl.test.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [
              {
                "name": "beforeAll",
                "position": 9,
                "source": "vitest",
              },
              {
                "name": "describe",
                "position": 20,
                "source": "vitest",
              },
              {
                "name": "expect",
                "position": 30,
                "source": "vitest",
              },
              {
                "name": "it",
                "position": 38,
                "source": "vitest",
              },
              {
                "name": "formatRelativeDate",
                "position": 67,
                "source": "fixtures/ytsub-v3/app/utils/intl",
              },
              {
                "name": "mockTimezone",
                "position": 87,
                "source": "fixtures/ytsub-v3/app/utils/intl",
              },
              {
                "name": "fromTemporal",
                "position": 126,
                "source": "fixtures/ytsub-v3/app/utils/temporal-utils",
              },
              {
                "name": "toInstant",
                "position": 140,
                "source": "fixtures/ytsub-v3/app/utils/temporal-utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/intl.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "intl",
                "position": 174,
              },
              {
                "name": "mockTimezone",
                "position": 258,
              },
              {
                "name": "intlWrapper",
                "position": 397,
              },
              {
                "name": "formatRelativeDate",
                "position": 649,
              },
            ],
            "namedImports": [
              {
                "name": "createIntl",
                "position": 9,
                "source": "@formatjs/intl",
              },
              {
                "name": "tinyassert",
                "position": 54,
                "source": "@hiogawa/utils",
              },
              {
                "name": "getSystemTimezone",
                "position": 99,
                "source": "fixtures/ytsub-v3/app/utils/temporal-utils",
              },
              {
                "name": "toInstant",
                "position": 118,
                "source": "fixtures/ytsub-v3/app/utils/temporal-utils",
              },
              {
                "name": "toZdt",
                "position": 129,
                "source": "fixtures/ytsub-v3/app/utils/temporal-utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/json-extra.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "JSON_EXTRA",
                "position": 127,
              },
            ],
            "namedImports": [
              {
                "name": "createJsonExtra",
                "position": 9,
                "source": "@hiogawa/json-extra",
              },
              {
                "name": "defineJsonExtraExtension",
                "position": 26,
                "source": "@hiogawa/json-extra",
              },
              {
                "name": "ZodError",
                "position": 90,
                "source": "zod",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/language.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "isLanguageCode",
                "position": 2326,
              },
              {
                "name": "languageCodeToName",
                "position": 2429,
              },
              {
                "name": "FILTERED_LANGUAGE_CODES",
                "position": 2850,
              },
            ],
            "namedImports": [],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/loader-utils.server.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "wrapLoader",
                "position": 427,
              },
              {
                "name": "assertOrRespond",
                "position": 704,
              },
              {
                "name": "unwrapOrRespond",
                "position": 860,
              },
              {
                "name": "unwrapResultOrRespond",
                "position": 1008,
              },
              {
                "name": "unwrapZodResultOrRespond",
                "position": 1213,
              },
              {
                "name": "ctx_requireUserOrRedirect",
                "position": 1473,
              },
            ],
            "namedImports": [
              {
                "name": "LoaderArgs",
                "position": 9,
                "source": "@remix-run/server-runtime",
              },
              {
                "name": "json",
                "position": 21,
                "source": "@remix-run/server-runtime",
              },
              {
                "name": "redirect",
                "position": 27,
                "source": "@remix-run/server-runtime",
              },
              {
                "name": "$R",
                "position": 81,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
              {
                "name": "ctx_currentUser",
                "position": 118,
                "source": "fixtures/ytsub-v3/app/server/request-context/session",
              },
              {
                "name": "ctx_get",
                "position": 187,
                "source": "fixtures/ytsub-v3/app/server/request-context/storage",
              },
              {
                "name": "ctx_setFlashMessage",
                "position": 248,
                "source": "fixtures/ytsub-v3/app/utils/flash-message.server",
              },
              {
                "name": "JSON_EXTRA",
                "position": 310,
                "source": "fixtures/ytsub-v3/app/utils/json-extra",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/loader-utils.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "useLeafLoaderData",
                "position": 215,
              },
              {
                "name": "useLoaderDataExtra",
                "position": 415,
              },
              {
                "name": "disableUrlQueryRevalidation",
                "position": 579,
              },
              {
                "name": "useUrlQuery",
                "position": 833,
              },
              {
                "name": "useTypedUrlQuery",
                "position": 1472,
              },
              {
                "name": "prettierJson",
                "position": 2042,
              },
            ],
            "namedImports": [
              {
                "name": "ShouldRevalidateFunction",
                "position": 11,
                "source": "@remix-run/react",
              },
              {
                "name": "useLoaderData",
                "position": 39,
                "source": "@remix-run/react",
              },
              {
                "name": "useMatches",
                "position": 56,
                "source": "@remix-run/react",
              },
              {
                "name": "useSearchParams",
                "position": 70,
                "source": "@remix-run/react",
              },
              {
                "name": "default",
                "position": 121,
                "source": "react",
              },
              {
                "name": "z",
                "position": 155,
                "source": "zod",
              },
              {
                "name": "JSON_EXTRA",
                "position": 180,
                "source": "fixtures/ytsub-v3/app/utils/json-extra",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/misc-react.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "useEffectNoStrict",
                "position": 106,
              },
              {
                "name": "ClientOnly",
                "position": 426,
              },
            ],
            "namedImports": [
              {
                "name": "once",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "default",
                "position": 46,
                "source": "react",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/misc.test.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [
              {
                "name": "describe",
                "position": 9,
                "source": "vitest",
              },
              {
                "name": "expect",
                "position": 19,
                "source": "vitest",
              },
              {
                "name": "it",
                "position": 27,
                "source": "vitest",
              },
              {
                "name": "pathToRegExp",
                "position": 56,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/misc.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "createGetProxy",
                "position": 66,
              },
              {
                "name": "uninitialized",
                "position": 303,
              },
              {
                "name": "cls",
                "position": 425,
              },
              {
                "name": "usePromiseQueryOpitons",
                "position": 519,
              },
              {
                "name": "objectFromMap",
                "position": 669,
              },
              {
                "name": "objectFromMapDefault",
                "position": 1062,
              },
              {
                "name": "defaultObject",
                "position": 1333,
              },
              {
                "name": "none",
                "position": 1592,
              },
              {
                "name": "zipMax",
                "position": 1658,
              },
              {
                "name": "pathToRegExp",
                "position": 1880,
              },
            ],
            "namedImports": [
              {
                "name": "escapeRegExp",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "mapRegExp",
                "position": 23,
                "source": "@hiogawa/utils",
              },
              {
                "name": "range",
                "position": 34,
                "source": "@hiogawa/utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/node.server.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "exec",
                "position": 145,
              },
              {
                "name": "streamToString",
                "position": 280,
              },
            ],
            "namedImports": [
              {
                "name": "default",
                "position": 7,
                "source": "node:child_process",
              },
              {
                "name": "Readable",
                "position": 61,
                "source": "node:stream",
              },
              {
                "name": "promisify",
                "position": 101,
                "source": "node:util",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/opentelemetry-utils.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "initializeOpentelemetry",
                "position": 645,
              },
              {
                "name": "finalizeOpentelemetry",
                "position": 789,
              },
              {
                "name": "traceAsync",
                "position": 865,
              },
              {
                "name": "wrapTraceAsyncSimple",
                "position": 1911,
              },
            ],
            "namedImports": [
              {
                "name": "default",
                "position": 7,
                "source": "node:process",
              },
              {
                "name": "Span",
                "position": 47,
                "source": "@opentelemetry/api",
              },
              {
                "name": "SpanOptions",
                "position": 55,
                "source": "@opentelemetry/api",
              },
              {
                "name": "SpanStatusCode",
                "position": 70,
                "source": "@opentelemetry/api",
              },
              {
                "name": "context",
                "position": 88,
                "source": "@opentelemetry/api",
              },
              {
                "name": "trace",
                "position": 99,
                "source": "@opentelemetry/api",
              },
              {
                "name": "NodeSDK",
                "position": 144,
                "source": "@opentelemetry/sdk-node",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/page-handle.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [
              {
                "name": "default",
                "position": 7,
                "source": "react",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/pagination.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "PAGINATION_PARAMS_SCHEMA",
                "position": 39,
              },
            ],
            "namedImports": [
              {
                "name": "z",
                "position": 9,
                "source": "zod",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/password-utils.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "initializeArgon2",
                "position": 595,
              },
              {
                "name": "finalizeArgon2",
                "position": 708,
              },
              {
                "name": "toPasswordHash",
                "position": 1057,
              },
              {
                "name": "verifyPassword",
                "position": 1225,
              },
              {
                "name": "verifyPasswordNoop",
                "position": 1658,
              },
            ],
            "namedImports": [
              {
                "name": "randomBytes",
                "position": 9,
                "source": "node:crypto",
              },
              {
                "name": "promisify",
                "position": 52,
                "source": "node:util",
              },
              {
                "name": "initWorker",
                "position": 91,
                "source": "@hiogawa/argon2-wasm-bindgen/dist/worker-node",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/practice-system.test.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [
              {
                "name": "mapGroupBy",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "tinyassert",
                "position": 21,
                "source": "@hiogawa/utils",
              },
              {
                "name": "beforeAll",
                "position": 66,
                "source": "vitest",
              },
              {
                "name": "describe",
                "position": 77,
                "source": "vitest",
              },
              {
                "name": "expect",
                "position": 87,
                "source": "vitest",
              },
              {
                "name": "it",
                "position": 95,
                "source": "vitest",
              },
              {
                "name": "E",
                "position": 124,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "T",
                "position": 127,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "db",
                "position": 130,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "selectOne",
                "position": 134,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "DEFAULT_DECK_CACHE",
                "position": 191,
                "source": "fixtures/ytsub-v3/app/db/types",
              },
              {
                "name": "importSeed",
                "position": 241,
                "source": "fixtures/ytsub-v3/app/misc/seed-utils",
              },
              {
                "name": "useUser",
                "position": 290,
                "source": "fixtures/ytsub-v3/app/misc/test-helper",
              },
              {
                "name": "useUserVideo",
                "position": 299,
                "source": "fixtures/ytsub-v3/app/misc/test-helper",
              },
              {
                "name": "getUserDeckPracticeStatistics",
                "position": 351,
                "source": "fixtures/ytsub-v3/app/trpc/routes/decks",
              },
              {
                "name": "PracticeSystem",
                "position": 423,
                "source": "fixtures/ytsub-v3/app/utils/practice-system",
              },
              {
                "name": "queryNextPracticeEntryRandomModeBatch",
                "position": 441,
                "source": "fixtures/ytsub-v3/app/utils/practice-system",
              },
              {
                "name": "resetDeckCache",
                "position": 482,
                "source": "fixtures/ytsub-v3/app/utils/practice-system",
              },
              {
                "name": "updateDeckCache",
                "position": 500,
                "source": "fixtures/ytsub-v3/app/utils/practice-system",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/practice-system.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "updateDeckCache",
                "position": 5770,
              },
              {
                "name": "resetDeckCache",
                "position": 6891,
              },
              {
                "name": "getDailyPracticeStatistics",
                "position": 8940,
              },
              {
                "name": "queryNextPracticeEntryRandomModeBatch",
                "position": 11903,
              },
            ],
            "namedImports": [
              {
                "name": "HashRng",
                "position": 11,
                "source": "@hiogawa/utils",
              },
              {
                "name": "difference",
                "position": 22,
                "source": "@hiogawa/utils",
              },
              {
                "name": "groupBy",
                "position": 36,
                "source": "@hiogawa/utils",
              },
              {
                "name": "mapGroupBy",
                "position": 47,
                "source": "@hiogawa/utils",
              },
              {
                "name": "range",
                "position": 61,
                "source": "@hiogawa/utils",
              },
              {
                "name": "sortBy",
                "position": 70,
                "source": "@hiogawa/utils",
              },
              {
                "name": "tinyassert",
                "position": 80,
                "source": "@hiogawa/utils",
              },
              {
                "name": "typedBoolean",
                "position": 94,
                "source": "@hiogawa/utils",
              },
              {
                "name": "Temporal",
                "position": 142,
                "source": "@js-temporal/polyfill",
              },
              {
                "name": "AnyColumn",
                "position": 192,
                "source": "drizzle-orm",
              },
              {
                "name": "GetColumnData",
                "position": 203,
                "source": "drizzle-orm",
              },
              {
                "name": "SQL",
                "position": 218,
                "source": "drizzle-orm",
              },
              {
                "name": "sql",
                "position": 228,
                "source": "drizzle-orm",
              },
              {
                "name": "E",
                "position": 263,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "T",
                "position": 266,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "TT",
                "position": 269,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "db",
                "position": 273,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "selectOne",
                "position": 277,
                "source": "fixtures/ytsub-v3/app/db/drizzle-client.server",
              },
              {
                "name": "BookmarkEntryTable",
                "position": 341,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "DeckTable",
                "position": 363,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "PracticeEntryTable",
                "position": 376,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "UserTable",
                "position": 398,
                "source": "fixtures/ytsub-v3/app/db/models",
              },
              {
                "name": "PRACTICE_ACTION_TYPES",
                "position": 443,
                "source": "fixtures/ytsub-v3/app/db/types",
              },
              {
                "name": "PRACTICE_QUEUE_TYPES",
                "position": 468,
                "source": "fixtures/ytsub-v3/app/db/types",
              },
              {
                "name": "PracticeActionType",
                "position": 492,
                "source": "fixtures/ytsub-v3/app/db/types",
              },
              {
                "name": "PracticeQueueType",
                "position": 514,
                "source": "fixtures/ytsub-v3/app/db/types",
              },
              {
                "name": "objectFromMap",
                "position": 564,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "objectFromMapDefault",
                "position": 579,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "fromTemporal",
                "position": 626,
                "source": "fixtures/ytsub-v3/app/utils/temporal-utils",
              },
              {
                "name": "toInstant",
                "position": 640,
                "source": "fixtures/ytsub-v3/app/utils/temporal-utils",
              },
              {
                "name": "toZdt",
                "position": 651,
                "source": "fixtures/ytsub-v3/app/utils/temporal-utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/react-query-utils.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "QueryClientWrapper",
                "position": 337,
              },
            ],
            "namedImports": [
              {
                "name": "QueryCache",
                "position": 11,
                "source": "@tanstack/react-query",
              },
              {
                "name": "QueryClient",
                "position": 25,
                "source": "@tanstack/react-query",
              },
              {
                "name": "QueryClientProvider",
                "position": 40,
                "source": "@tanstack/react-query",
              },
              {
                "name": "ReactQueryDevtools",
                "position": 102,
                "source": "@tanstack/react-query-devtools",
              },
              {
                "name": "default",
                "position": 169,
                "source": "react",
              },
              {
                "name": "toast",
                "position": 198,
                "source": "react-hot-toast",
              },
              {
                "name": "rpcClientQuery",
                "position": 239,
                "source": "fixtures/ytsub-v3/app/trpc/client",
              },
              {
                "name": "useDocumentEvent",
                "position": 288,
                "source": "fixtures/ytsub-v3/app/utils/hooks-client-utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/temporal-utils.test.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [
              {
                "name": "Temporal",
                "position": 9,
                "source": "@js-temporal/polyfill",
              },
              {
                "name": "describe",
                "position": 59,
                "source": "vitest",
              },
              {
                "name": "expect",
                "position": 69,
                "source": "vitest",
              },
              {
                "name": "it",
                "position": 77,
                "source": "vitest",
              },
              {
                "name": "fromTemporal",
                "position": 108,
                "source": "fixtures/ytsub-v3/app/utils/temporal-utils",
              },
              {
                "name": "getZonedDateRange",
                "position": 124,
                "source": "fixtures/ytsub-v3/app/utils/temporal-utils",
              },
              {
                "name": "isValidTimezone",
                "position": 145,
                "source": "fixtures/ytsub-v3/app/utils/temporal-utils",
              },
              {
                "name": "toZdt",
                "position": 164,
                "source": "fixtures/ytsub-v3/app/utils/temporal-utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/temporal-utils.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "getSystemTimezone",
                "position": 198,
              },
              {
                "name": "toZdt",
                "position": 322,
              },
              {
                "name": "toInstant",
                "position": 472,
              },
              {
                "name": "fromTemporal",
                "position": 573,
              },
              {
                "name": "isValidTimezone",
                "position": 687,
              },
              {
                "name": "getZonedDateRange",
                "position": 812,
              },
              {
                "name": "formatDateRange",
                "position": 2076,
              },
            ],
            "namedImports": [
              {
                "name": "assertUnreachable",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "tinyassert",
                "position": 28,
                "source": "@hiogawa/utils",
              },
              {
                "name": "wrapError",
                "position": 40,
                "source": "@hiogawa/utils",
              },
              {
                "name": "Temporal",
                "position": 84,
                "source": "@js-temporal/polyfill",
              },
              {
                "name": "toTemporalInstant",
                "position": 94,
                "source": "@js-temporal/polyfill",
              },
              {
                "name": "DateRangeType",
                "position": 158,
                "source": "fixtures/ytsub-v3/app/misc/routes",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/toast-utils.tsx",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "ToastWrapper",
                "position": 51,
              },
              {
                "name": "toastInfo",
                "position": 290,
              },
            ],
            "namedImports": [
              {
                "name": "Toaster",
                "position": 9,
                "source": "react-hot-toast",
              },
              {
                "name": "toast",
                "position": 18,
                "source": "react-hot-toast",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/turnstile-utils.server.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "verifyTurnstile",
                "position": 269,
              },
            ],
            "namedImports": [
              {
                "name": "tinyassert",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "z",
                "position": 54,
                "source": "zod",
              },
              {
                "name": "serverConfig",
                "position": 79,
                "source": "fixtures/ytsub-v3/app/utils/config",
              },
              {
                "name": "wrapTraceAsyncSimple",
                "position": 120,
                "source": "fixtures/ytsub-v3/app/utils/opentelemetry-utils",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/turnstile-utils.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "useTurnstile",
                "position": 1037,
              },
            ],
            "namedImports": [
              {
                "name": "newPromiseWithResolvers",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "once",
                "position": 34,
                "source": "@hiogawa/utils",
              },
              {
                "name": "tinyassert",
                "position": 40,
                "source": "@hiogawa/utils",
              },
              {
                "name": "useQuery",
                "position": 85,
                "source": "@tanstack/react-query",
              },
              {
                "name": "default",
                "position": 133,
                "source": "react",
              },
              {
                "name": "publicConfig",
                "position": 162,
                "source": "fixtures/ytsub-v3/app/utils/config-public",
              },
              {
                "name": "loadScript",
                "position": 210,
                "source": "fixtures/ytsub-v3/app/utils/dom-utils",
              },
              {
                "name": "usePromiseQueryOpitons",
                "position": 252,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/types.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "Z_VIDEO_METADATA",
                "position": 39,
              },
              {
                "name": "DUMMY_VIDEO_METADATA",
                "position": 950,
              },
              {
                "name": "Z_CAPTION_ENTRY",
                "position": 1671,
              },
            ],
            "namedImports": [
              {
                "name": "z",
                "position": 9,
                "source": "zod",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/youtube.test.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [],
            "namedImports": [
              {
                "name": "objectOmit",
                "position": 9,
                "source": "@hiogawa/utils",
              },
              {
                "name": "tinyassert",
                "position": 21,
                "source": "@hiogawa/utils",
              },
              {
                "name": "wrapErrorAsync",
                "position": 33,
                "source": "@hiogawa/utils",
              },
              {
                "name": "describe",
                "position": 82,
                "source": "vitest",
              },
              {
                "name": "expect",
                "position": 92,
                "source": "vitest",
              },
              {
                "name": "it",
                "position": 100,
                "source": "vitest",
              },
              {
                "name": "fetchCaptionEntries",
                "position": 131,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "fetchVideoMetadata",
                "position": 154,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "mergeTtmlEntries",
                "position": 176,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
              {
                "name": "ttmlToEntries",
                "position": 196,
                "source": "fixtures/ytsub-v3/app/utils/youtube",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
        {
          "file": "./fixtures/ytsub-v3/app/utils/youtube.ts",
          "parseOutput": {
            "bareImports": [],
            "namedExports": [
              {
                "name": "fetchVideoMetadata",
                "position": 882,
              },
              {
                "name": "fetchVideoMetadataRaw",
                "position": 1118,
              },
              {
                "name": "parseVideoId",
                "position": 2040,
              },
              {
                "name": "toThumbnail",
                "position": 2496,
              },
              {
                "name": "parseVssId",
                "position": 2614,
              },
              {
                "name": "encodeAdvancedModeLanguageCode",
                "position": 2769,
              },
              {
                "name": "toCaptionConfigOptions",
                "position": 2871,
              },
              {
                "name": "captionConfigToUrl",
                "position": 3592,
              },
              {
                "name": "findCaptionConfigPair",
                "position": 4692,
              },
              {
                "name": "ttmlToEntries",
                "position": 5464,
              },
              {
                "name": "mergeTtmlEntries",
                "position": 6035,
              },
              {
                "name": "stringifyTimestamp",
                "position": 8572,
              },
              {
                "name": "Z_NEW_VIDEO",
                "position": 9105,
              },
              {
                "name": "fetchCaptionEntries",
                "position": 9458,
              },
              {
                "name": "fetchTtmlEntries",
                "position": 9972,
              },
              {
                "name": "usePlayerLoader",
                "position": 11907,
              },
            ],
            "namedImports": [
              {
                "name": "HashKeyDefaultMap",
                "position": 11,
                "source": "@hiogawa/utils",
              },
              {
                "name": "newPromiseWithResolvers",
                "position": 32,
                "source": "@hiogawa/utils",
              },
              {
                "name": "once",
                "position": 59,
                "source": "@hiogawa/utils",
              },
              {
                "name": "sortBy",
                "position": 67,
                "source": "@hiogawa/utils",
              },
              {
                "name": "tinyassert",
                "position": 77,
                "source": "@hiogawa/utils",
              },
              {
                "name": "zip",
                "position": 91,
                "source": "@hiogawa/utils",
              },
              {
                "name": "useRefCallbackEffect",
                "position": 130,
                "source": "@hiogawa/utils-react",
              },
              {
                "name": "useStableCallback",
                "position": 152,
                "source": "@hiogawa/utils-react",
              },
              {
                "name": "useMutation",
                "position": 210,
                "source": "@tanstack/react-query",
              },
              {
                "name": "XMLParser",
                "position": 263,
                "source": "fast-xml-parser",
              },
              {
                "name": "default",
                "position": 306,
                "source": "react",
              },
              {
                "name": "toast",
                "position": 335,
                "source": "react-hot-toast",
              },
              {
                "name": "z",
                "position": 376,
                "source": "zod",
              },
              {
                "name": "loadScript",
                "position": 401,
                "source": "fixtures/ytsub-v3/app/utils/dom-utils",
              },
              {
                "name": "FILTERED_LANGUAGE_CODES",
                "position": 445,
                "source": "fixtures/ytsub-v3/app/utils/language",
              },
              {
                "name": "LanguageCode",
                "position": 472,
                "source": "fixtures/ytsub-v3/app/utils/language",
              },
              {
                "name": "languageCodeToName",
                "position": 488,
                "source": "fixtures/ytsub-v3/app/utils/language",
              },
              {
                "name": "uninitialized",
                "position": 538,
                "source": "fixtures/ytsub-v3/app/utils/misc",
              },
              {
                "name": "CaptionConfig",
                "position": 580,
                "source": "fixtures/ytsub-v3/app/utils/types",
              },
              {
                "name": "CaptionConfigOptions",
                "position": 597,
                "source": "fixtures/ytsub-v3/app/utils/types",
              },
              {
                "name": "CaptionEntry",
                "position": 621,
                "source": "fixtures/ytsub-v3/app/utils/types",
              },
              {
                "name": "VideoMetadata",
                "position": 637,
                "source": "fixtures/ytsub-v3/app/utils/types",
              },
              {
                "name": "Z_VIDEO_METADATA",
                "position": 654,
                "source": "fixtures/ytsub-v3/app/utils/types",
              },
            ],
            "namedReExports": [],
            "namespaceImports": [],
            "namespaceReExports": [],
          },
        },
      ]
    `);
  });
});
