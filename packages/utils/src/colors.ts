// ansi escape codes
// https://en.wikipedia.org/wiki/ANSI_escape_code#SGR_(Select_Graphic_Rendition)_parameters
// https://github.com/chalk/chalk
// https://github.com/alexeyraspopov/picocolors
const codeMap = {
  // 3 bit fg/bg colors
  black: [30, 39],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],
  magenta: [35, 39],
  cyan: [36, 39],
  white: [37, 39],
  bgBlack: [40, 49],
  bgRed: [41, 49],
  bgGreen: [42, 49],
  bgYellow: [43, 49],
  bgBlue: [44, 49],
  bgMagenta: [45, 49],
  bgCyan: [46, 49],
  bgWhite: [47, 49],
  // styles
  bold: [1, 22],
  dim: [2, 22],
  underline: [4, 24],
  inverse: [7, 27],
};

type Code = keyof typeof codeMap;

type Api = ((v: string) => string) & {
  [K in Code]: Api;
};

function createApi(props: string[]): unknown {
  return new Proxy(() => {}, {
    // recursively accumulate property accesses
    get(target, p, _receiver) {
      if (typeof p === "symbol" || p in target) {
        // @ts-expect-error
        return Reflect.get(...arguments);
      }
      return createApi([...props, p]);
    },
    // wrap with escape codes
    apply(_target, _thisArg, args) {
      let s = args[0] as string;
      for (const code of props) {
        const [start, end] = codeMap[code as Code];
        s = `\u001B[${start}m${s}\u001B[${end}m`;
      }
      return s;
    },
  });
}

export const colors = /* @__PURE__ */ createApi([]) as Api;
