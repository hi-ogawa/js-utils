import fastGlob from "fast-glob";
import { describe, expect, it } from "vitest";
import { run } from "./runner";

describe.skip("fixture", () => {
  it("ytsub", async () => {
    const base = "./fixtures/ytsub-v3/app";
    const files = await fastGlob([base + "/**/*.ts", base + "/**/*.tsx"]);
    files.sort(); // fastGlob not deterministic?
    expect(files.length).toMatchInlineSnapshot("158");

    const result = run(files);
    expect(result.errors).toMatchInlineSnapshot("[]");

    const unused = [...result.exportUsages]
      .map(([k, vs]) => [k, vs.filter((v) => !v.used)] as const)
      .filter(([_k, vs]) => vs.length > 0);
    expect(new Map(unused)).toMatchInlineSnapshot(`
      Map {
        "fixtures/ytsub-v3/app/db/__migration-stub.ts" => [
          {
            "name": "up",
            "used": false,
          },
          {
            "name": "down",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/db/migrations/20230417034357_captionEntries-index-videoId-index.ts" => [
          {
            "name": "up",
            "used": false,
          },
          {
            "name": "down",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/db/migrations/20230422054538_drop-captionEntries_videoId_key.ts" => [
          {
            "name": "up",
            "used": false,
          },
          {
            "name": "down",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/db/migrations/20230422063146_add-decks-cache.ts" => [
          {
            "name": "up",
            "used": false,
          },
          {
            "name": "down",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/db/migrations/20230423124137_tweak-index.ts" => [
          {
            "name": "up",
            "used": false,
          },
          {
            "name": "down",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/db/migrations/20230501041818_bookmarkEntries_userId_createdAt_key.ts" => [
          {
            "name": "up",
            "used": false,
          },
          {
            "name": "down",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/db/migrations/20230527023906_add-user-email.ts" => [
          {
            "name": "up",
            "used": false,
          },
          {
            "name": "down",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/entry.server.tsx" => [
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/misc/entry-express.ts" => [
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/misc/test-setup-global-e2e.ts" => [
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/misc/test-setup-global.ts" => [
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/root.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
          {
            "name": "shouldRevalidate",
            "used": false,
          },
          {
            "name": "default",
            "used": false,
          },
          {
            "name": "ErrorBoundary",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/bookmarks/history-chart.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
          {
            "name": "shouldRevalidate",
            "used": false,
          },
          {
            "name": "handle",
            "used": false,
          },
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/bookmarks/index.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
          {
            "name": "shouldRevalidate",
            "used": false,
          },
          {
            "name": "handle",
            "used": false,
          },
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/caption-editor/index.tsx" => [
          {
            "name": "handle",
            "used": false,
          },
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/caption-editor/watch.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
          {
            "name": "handle",
            "used": false,
          },
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/decks/$id/edit.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
          {
            "name": "handle",
            "used": false,
          },
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/decks/$id/export.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/decks/$id/history-graph.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
          {
            "name": "shouldRevalidate",
            "used": false,
          },
          {
            "name": "handle",
            "used": false,
          },
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/decks/$id/history.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
          {
            "name": "shouldRevalidate",
            "used": false,
          },
          {
            "name": "handle",
            "used": false,
          },
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/decks/$id/index.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
          {
            "name": "handle",
            "used": false,
          },
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/decks/$id/practice.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
          {
            "name": "handle",
            "used": false,
          },
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/decks/import.tsx" => [
          {
            "name": "handle",
            "used": false,
          },
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/decks/index.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
          {
            "name": "handle",
            "used": false,
          },
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/decks/new.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
          {
            "name": "handle",
            "used": false,
          },
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/dev/debug-env.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/dev/debug.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/dev/emails.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/dev/health-check-db.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/dev/health-check.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/dev/knex.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/dev/stop.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/index.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
          {
            "name": "handle",
            "used": false,
          },
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/share-target.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/users/me.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
          {
            "name": "handle",
            "used": false,
          },
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/users/password-new.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
          {
            "name": "handle",
            "used": false,
          },
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/users/password-reset.tsx" => [
          {
            "name": "handle",
            "used": false,
          },
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/users/register.tsx" => [
          {
            "name": "handle",
            "used": false,
          },
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/users/signin.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
          {
            "name": "handle",
            "used": false,
          },
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/users/verify.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/videos/$id.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
          {
            "name": "shouldRevalidate",
            "used": false,
          },
          {
            "name": "handle",
            "used": false,
          },
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/videos/index.tsx" => [
          {
            "name": "handle",
            "used": false,
          },
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/routes/videos/new.tsx" => [
          {
            "name": "loader",
            "used": false,
          },
          {
            "name": "handle",
            "used": false,
          },
          {
            "name": "default",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/utils/flash-message.ts" => [
          {
            "name": "handleFlashMessage",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/utils/hooks-client-utils.ts" => [
          {
            "name": "useMatchMedia",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/utils/loader-utils.server.ts" => [
          {
            "name": "unwrapOrRespond",
            "used": false,
          },
          {
            "name": "unwrapResultOrRespond",
            "used": false,
          },
        ],
        "fixtures/ytsub-v3/app/utils/loader-utils.ts" => [
          {
            "name": "useUrlQuery",
            "used": false,
          },
        ],
      }
    `);
  });
});
