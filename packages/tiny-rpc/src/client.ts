import { tinyassert } from "@hiogawa/utils";
import {
  type FnRecord,
  type FnRecordToAsync,
  createGetterProxy,
} from "./common";

export function createTinyRpcClientProxy<R extends FnRecord>({
  endpoint,
}: {
  endpoint: string;
}): FnRecordToAsync<R> {
  return createGetterProxy((path) => {
    tinyassert(typeof path === "string");

    return async (input: unknown) => {
      const url = [endpoint, path].join("/");
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ input }),
        headers: {
          "content-type": "application/json",
        },
      });
      tinyassert(response.ok);

      const responseJson = await response.json();
      tinyassert(responseJson);
      tinyassert(typeof responseJson === "object");
      tinyassert("output" in responseJson);

      return responseJson.output;
    };
  }) as any;
}
