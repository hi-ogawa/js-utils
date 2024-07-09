import { transform } from "./transform";

export type TinyRefreshLoaderOptions = {
  refreshRuntime?: string;
  runtime?: string;
  debug?: string;
};

export default function loader(this: any, input: string) {
  const callback = this.async();
  const options = this.getOptions() as TinyRefreshLoaderOptions;
  transform(input, {
    refreshRuntime: options.refreshRuntime ?? "@hiogawa/tiny-refresh",
    runtime: "react",
    mode: "webpack",
    debug: true,
  }).then(
    (result) => callback(null, result ?? input),
    (error) => callback(error)
  );
}
