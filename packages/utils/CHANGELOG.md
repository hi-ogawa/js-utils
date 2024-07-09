# @hiogawa/utils

## v1.7.0

- feat: export `ManualPromise` ([#220](https://github.com/hi-ogawa/js-utils/pull/220))
- feat: add `createDebug` ([#219](https://github.com/hi-ogawa/js-utils/pull/219))
- fix: fix this context in `memoize` ([#216](https://github.com/hi-ogawa/js-utils/pull/216))
- fix: add default error message to tinyassert ([#214](https://github.com/hi-ogawa/js-utils/pull/214))
- feat: add edit distance ([#182](https://github.com/hi-ogawa/js-utils/pull/182))
- feat: add `sortByArray` ([#135](https://github.com/hi-ogawa/js-utils/pull/135))
- fix: fix `objectMapValues` typing ([#191](https://github.com/hi-ogawa/js-utils/pull/191))
- feat: replace `newPromiseWithResolvers` with `createManualPromise` ([#187](https://github.com/hi-ogawa/js-utils/pull/187))
- refactor: simplify `regExpRaw` ([#180](https://github.com/hi-ogawa/js-utils/pull/180))
- feat: set `HashRng` default seed ([#175](https://github.com/hi-ogawa/js-utils/pull/175))
- feat: negative `range` as empty ([#154](https://github.com/hi-ogawa/js-utils/pull/154))
- feat: add `none<T>()` ([#140](https://github.com/hi-ogawa/js-utils/pull/140))
- feat: ability to disable `colors` ([#134](https://github.com/hi-ogawa/js-utils/pull/134))
- feat: handle optional key for object utils ([#123](https://github.com/hi-ogawa/js-utils/pull/123))
- feat: add `subscribeEventListenerFactory` ([#122](https://github.com/hi-ogawa/js-utils/pull/122))
- feat: add record object utils ([#120](https://github.com/hi-ogawa/js-utils/pull/120))
- feat: add more ansi escape codes ([#118](https://github.com/hi-ogawa/js-utils/pull/118))
- feat: add `splitByChunk` ([#117](https://github.com/hi-ogawa/js-utils/pull/117))
- feat: add ansi 3bit color utils ([#115](https://github.com/hi-ogawa/js-utils/pull/115))
- feat: add `murmur3_32` ([#100](https://github.com/hi-ogawa/js-utils/pull/100))
- feat: add `TtlCache` and `LruCache` ([#93](https://github.com/hi-ogawa/js-utils/pull/93))
- feat: support `cache` option for `memoize` ([#92](https://github.com/hi-ogawa/js-utils/pull/92))
- feat: add `memoize` ([#91](https://github.com/hi-ogawa/js-utils/pull/91))

## 1.6.0

### Minor Changes

- fc9cf5d: feat: add `zipMax`
- a7a9e87: feat: add `formatError`

## 1.5.0

### Major Changes

- ba73a80: chore: remove booleanGuard

### Minor Changes

- a95a31e: feat: add once
- fdd8d89: feat: add okToOption
- 5b652c7: feat: add zip
- 32122e7: feat: add `HashKeyMap` and `HashKeyDefaultMap`
- b72aff7: feat: add mapRegExp and escapeRegExp
- 4195718: feat: support DefaultMap constructor entries
- 7fc0ae7: feat: add `regExpRaw`
- dbfc1c0: feat: add `capitalize` + `difference`
- cc9cd98: feat: add newPromiseWithResolvers
- c5b8152: feat: support Iterable as DefaultMap constructor parameter
- 26c1e14: feat: add `hashInt32`, `hashString`, `HashRng`
- 29fe0e8: feat: add mapGroupBy
- 3a58354: feat: add assertUnreachable

### Patch Changes

- 2cfa6cb: fix: fix `once` with arguments

## 1.4.1

### Patch Changes

- fix: fix export

## 1.4.0

### Minor Changes

- be406d6: feat: more lodash utils

## 1.3.0

### Minor Changes

- dd76450: feat: add UncheckedMap, objectPick/Omit/PickBy/OmitBy/Keys
- 1da1745: feat: add alias `typedBoolean` for `booleanGuard`
- bf9a01f: feat: add mapKeys/mapValues/pickBy

## 1.2.0

### Minor Changes

- 7842aa9: add lodake-like utils
