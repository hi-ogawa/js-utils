// not really compat but maybe good enough for simple cases...
// cf. https://github.com/preactjs/preact/blame/9c5a82efcc3dcbd0035c694817a3022d81264687/compat/src/index.js

// probably critical missing features
// - defaultValue prop
// - dangerouslySetInnerHTML prop
// - mutable ref prop
// - forwardRef
// - useLayoutEffect

import {
  Fragment,
  render,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "../index";
import { createRoot, useSyncExternalStore } from "./misc";

export {
  render,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  createRoot,
};

export default {
  render,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  createRoot,
};
