import { normalizeComponentChildren } from "../helper/hyperscript";
import { HookContext } from "../hooks";
import { updateCustomNodeUnsupported } from "../reconciler";
import {
  NODE_TYPE_CUSTOM,
  NODE_TYPE_EMPTY,
  NODE_TYPE_FRAGMENT,
  NODE_TYPE_TAG,
  NODE_TYPE_TEXT,
  type VNode,
  type VTag,
  isReservedTagProp,
} from "../virtual-dom";

export function renderToString(vnode: VNode): string {
  return new SsrManager().render(vnode);
}

class SsrManager {
  selectTagStack: VTag[] = [];

  render(vnode: VNode): string {
    if (vnode.type === NODE_TYPE_EMPTY) {
      return "";
    } else if (vnode.type === NODE_TYPE_TAG) {
      return this.renderTag(vnode);
    } else if (vnode.type === NODE_TYPE_TEXT) {
      return escapeHtml(vnode.data);
    } else if (vnode.type === NODE_TYPE_CUSTOM) {
      const { render, props } = vnode;
      const hookContext = new HookContext(updateCustomNodeUnsupported);
      const vchild = hookContext.wrap(() => render(props));
      return this.render(vchild);
    } else if (vnode.type === NODE_TYPE_FRAGMENT) {
      // note that whitespaces between children are injected during JSX transpilation e.g.
      // https://babeljs.io/repl#?browsers=defaults%2C%20not%20ie%2011%2C%20not%20ie_mob%2011&build=&builtIns=false&corejs=3.21&spec=false&loose=false&code_lz=DwEwlgbgfAhgBAIzgbwEQGNUF80my1AU22AHpxog&debug=false&forceAllTransforms=false&modules=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=env%2Creact%2Cstage-2&prettier=false&targets=&version=7.23.1&externalPlugins=&assumptions=%7B%7D
      // <div>a b {"c"}{"d"} {"e"}</div> => { children: ["a b ", "c", "d", " ", "e"] }
      let result = "";
      for (const vchild of vnode.children) {
        result += this.render(vchild);
      }
      return result;
    }
    return vnode satisfies never;
  }

  // cf. https://github.com/preactjs/preact-render-to-string/blob/ba4f4eb1f81e01ac15aef377ae609059e9b2ffce/src/index.js#L322
  renderTag(vnode: VTag) {
    const { name, props } = vnode;
    let openTag = `<${name}`;
    let innerOverride: string | undefined;
    for (let k in props) {
      if (isReservedTagProp(k)) {
        continue;
      }
      let v = props[k];
      if (v == null || k.startsWith("on")) {
        continue;
      }
      if (k === "className") {
        k = "class";
      }
      if (k === "value") {
        if (name === "textarea") {
          innerOverride = escapeHtml(String(v));
          continue;
        }
        if (name === "select") {
          // `select.value` will be replace with decendent's `option.selected`
          continue;
        }
        if (name === "option") {
          const select = this.selectTagStack.at(-1);
          if (select && select.props["value"] === v) {
            openTag += ` selected="true"`;
          }
        }
      }
      // TODO: more edge cases (svg, etc...)
      if (k.startsWith("aria")) {
        k = camelToKebab(k);
      } else {
        k = k.toLowerCase();
      }
      v = escapeHtml(String(v));
      openTag += ` ${k}="${v}"`;
    }
    // self-closing
    if (VOID_ELEMENTS.has(name)) {
      return openTag + "/>";
    }
    // textarea.value
    if (typeof innerOverride === "string") {
      return `${openTag}>${innerOverride}</${name}>`;
    }

    // keep track of <select> and recurse
    if (name === "select") {
      this.selectTagStack.push(vnode);
    }
    const inner = this.render(normalizeComponentChildren(props.children));
    if (name === "select") {
      this.selectTagStack.pop();
    }
    return `${openTag}>${inner}</${name}>`;
  }
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
