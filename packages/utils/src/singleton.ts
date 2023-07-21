import { range } from "./lodash";
import { tinyassert } from "./tinyassert";

// tsyringe-like idea https://github.com/microsoft/tsyringe
// but with following benefits
// - extreme simplicity
// - it doesn't rely on typescript decorator metadata
// - it provides dependency graph (e.g. to implement per-module async init/deinit hooks)

// references
// - https://github.com/microsoft/tsyringe
// - https://docs.nestjs.com/fundamentals/lifecycle-events

type InstanceKey = new () => unknown;
type Instance = unknown;

export interface SingletonHooks {
  init: () => void | Promise<void>;
  deinit: () => void | Promise<void>;
}

export class Singleton {
  instances = new Map<InstanceKey, Instance>();

  // manage `resolve` call stack to create module dependency graph
  // which is necessary for init/deinit ordering
  stack: InstanceKey[] = [];
  deps: [InstanceKey, InstanceKey][] = [];

  resolve<T>(ctor: new () => T): T {
    // detect cycle
    if (this.stack.includes(ctor)) {
      throw new Error("Singleton.resolve detected cyclic dependency", {
        cause: ctor,
      });
    }

    // add dependency
    const parent = this.stack.at(-1);
    if (parent) {
      this.deps.push([parent, ctor]);
    }

    // skip already instantiated
    if (this.instances.has(ctor)) {
      return this.instances.get(ctor) as T;
    }

    // instantiate within new stack
    this.stack.push(ctor);
    const instance = new ctor();
    this.instances.set(ctor, instance);
    this.stack.pop();

    return instance as T;
  }

  async init(): Promise<void> {
    for (const instance of this.sortDeps()) {
      await (instance as Partial<SingletonHooks>).init?.();
    }
  }

  async deinit(): Promise<void> {
    // TODO: shouldn't it be reversed?
    for (const instance of this.sortDeps()) {
      await (instance as Partial<SingletonHooks>).deinit?.();
    }
  }

  sortDeps(): Instance[] {
    const keys = [...this.instances.keys()];
    const sortedKeys = topologicalSort(keys, this.deps);
    return sortedKeys.map((k) => this.instances.get(k)!);
  }
}

//
// topological sort
//

function topologicalSort<T>(verts: T[], edges: [T, T][]): T[] {
  const indexMap = new Map(verts.map((k, i) => [k, i]));

  const n = verts.length;
  const adj: number[][] = range(n).map(() => []);
  for (const [k1, k2] of edges) {
    const i1 = indexMap.get(k1);
    const i2 = indexMap.get(k2);
    tinyassert(typeof i1 === "number");
    tinyassert(typeof i2 === "number");
    adj[i1].push(i2);
  }

  const sortedIndices = topologicalSortInner(adj);
  return sortedIndices.map((i) => verts[i]);
}

function topologicalSortInner(adj: number[][]): number[] {
  // dfs + sort by "exit" time

  const n = adj.length;
  const visited = range(n).map(() => false);
  const result: number[] = [];

  function dfs(v: number) {
    visited[v] = true;
    for (const u of adj[v]) {
      if (!visited[u]) {
        dfs(u);
      }
    }
    result.push(v);
  }

  for (const v of range(n)) {
    if (!visited[v]) {
      dfs(v);
    }
  }

  return result;
}
