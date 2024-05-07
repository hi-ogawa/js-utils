import { compose } from "@hattip/compose";
import { createLoggerHandler } from "@hiogawa/utils-hattip";
import { requestContextStorageHandler } from "./request-context";
import { ssrHandler } from "./ssr";

export function createHattipApp() {
  return compose(
    createLoggerHandler(),
    requestContextStorageHandler(),
    ssrHandler(),
  );
}
