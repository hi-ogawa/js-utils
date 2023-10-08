import type { FC } from "../helper/common";

interface Context<T> {
  Provider: FC<{ value: T }>;
}

export function createContext<T>(_defaultValue: T): Context<T> {
  throw "todo";
}

export function useContext<T>(_context: Context<T>): T | undefined {
  throw "todo";
}
