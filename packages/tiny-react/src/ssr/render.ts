import { HookContext } from "../hooks";
import type { VNode, VTag } from "../virtual-dom";

export function renderToString(vnode: VNode): string {
  switch (vnode.type) {
    case "empty": {
      return "";
    }
    case "tag": {
      return renderTag(vnode);
    }
    case "text": {
      return escapeHtml(vnode.data);
    }
    case "custom": {
      const { render, props } = vnode;
      const hookContext = new HookContext(() => {});
      const vchild = hookContext.wrap(() => render(props));
      return renderToString(vchild);
    }
    case "fragment": {
      // TODO: how to whitespace?
      // https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Whitespace
      return vnode.children.map((vchild) => renderToString(vchild)).join(" ");
    }
  }
}

// learn more from https://github.com/preactjs/preact-render-to-string/blob/ba4f4eb1f81e01ac15aef377ae609059e9b2ffce/src/index.js#L322
function renderTag(vnode: VTag) {
  const { name, props, child } = vnode;
  let result = `<${name}`;
  for (let k in props) {
    let v = props[k];
    if (v == null || k.startsWith("on")) {
      continue;
    }
    if (k === "className") {
      k = "class";
    }
    k = camelToKebab(k);
    v = escapeHtml(String(v));
    result += ` ${k}="${v}"`;
  }
  if (VOID_ELEMENTS.has(name)) {
    return result + "/>";
  }
  return result + ">" + renderToString(child) + `</${name}>`;
}

// https://developer.mozilla.org/en-US/docs/Glossary/Void_element
const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

// from jsCase to html-case
function camelToKebab(s: string): string {
  // cf. https://github.com/cristianbote/goober/blob/a849b2d644146d96fa1dd1c560f6418ee1e1c469/src/core/parse.js#L48
  return s.replace(/[A-Z]/g, "-$&").toLowerCase();
}

// https://github.com/rakkasjs/rakkasjs/blob/c11edf8fc667b8d7f993659fba7e3354750a7f39/packages/rakkasjs/src/runtime/utils.ts#L19-L27
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
