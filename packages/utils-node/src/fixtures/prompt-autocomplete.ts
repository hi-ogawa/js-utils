import { promptAutocomplete } from "../prompt";

/*

demo
  npx tsx packages/utils-node/src/fixtures/prompt-autocomplete.ts

*/

// $ node -e 'console.log(JSON.stringify(require("node:module").builtinModules))'
// prettier-ignore
const builtinModules = ["_http_agent","_http_client","_http_common","_http_incoming","_http_outgoing","_http_server","_stream_duplex","_stream_passthrough","_stream_readable","_stream_transform","_stream_wrap","_stream_writable","_tls_common","_tls_wrap","assert","assert/strict","async_hooks","buffer","child_process","cluster","console","constants","crypto","dgram","diagnostics_channel","dns","dns/promises","domain","events","fs","fs/promises","http","http2","https","inspector","module","net","os","path","path/posix","path/win32","perf_hooks","process","punycode","querystring","readline","readline/promises","repl","stream","stream/consumers","stream/promises","stream/web","string_decoder","sys","timers","timers/promises","tls","trace_events","tty","url","util","util/types","v8","vm","worker_threads","zlib"];

async function main() {
  const result = await promptAutocomplete({
    message: "Select node builtin module",
    suggest: (input) => {
      return builtinModules.filter((v) => v.includes(input));
    },
  });
  console.log("[answer]", result);
}

main();
