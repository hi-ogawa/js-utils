import { fetchEventSource } from "@microsoft/fetch-event-source";
import { TypedEventTarget } from "./utils";

// fetch based polyfill by https://github.com/Azure/fetch-event-source
// currently only used for testing

export class FetchEventSource extends TypedEventTarget<
  EventSourceEventMap & { close: {} }
> {
  public fetchPromise: Promise<void>;

  constructor(public url: string) {
    super();
    this.fetchPromise = fetchEventSource(url, {
      fetch: globalThis.fetch,
      openWhenHidden: true,
      onopen: async (response) => {
        this.notify("open", response as any);
      },
      onerror: (e) => {
        this.notify("error", e);
      },
      onmessage: (ev) => {
        this.notify("message", ev as any);
      },
      onclose: () => {
        this.notify("close", {});
      },
    });
  }
}
