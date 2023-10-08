import { compose } from "@hattip/compose";
import { createLoggerHandler } from "@hiogawa/utils-hattip";
import { ssrHandler } from "./ssr";

export function createHattipApp() {
  return compose(createLoggerHandler(), ssrHandler());
}
