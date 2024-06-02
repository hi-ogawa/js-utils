import { compose } from "@hattip/compose";
import { requestContextStorageHandler } from "./request-context";
import { ssrHandler } from "./ssr";

export function createHattipApp() {
  return compose(requestContextStorageHandler(), ssrHandler());
}
