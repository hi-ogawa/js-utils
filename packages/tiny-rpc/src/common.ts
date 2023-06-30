type FnAny = (...args: any[]) => any;
type FnAnyToAsync<F extends FnAny> = (
  ...args: Parameters<F>
) => Promise<Awaited<ReturnType<F>>>;

export type FnRecord = Record<string, FnAny>;
export type FnRecordToAsync<R extends FnRecord> = {
  [K in keyof R]: FnAnyToAsync<R[K]>;
};

export function createGetterProxy(
  propHandler: (prop: string | symbol) => unknown
): unknown {
  return new Proxy(
    {},
    {
      get(_target, prop, _receiver) {
        return propHandler(prop);
      },
    }
  );
}
