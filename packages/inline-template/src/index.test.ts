import { describe, expect, it, vi } from "vitest";
import { InlineTemplateProcessor } from ".";

describe(InlineTemplateProcessor, () => {
  it("basic", async () => {
    const input = `\
<!--
%template-in-begin:some-id%
{% echo hello %}
%template-in-end:some-id%
-->

<!-- %template-out-begin:some-id% -->
anything here will be overwritten
<!-- %template-out-end:some-id% -->
`;
    const logFn = vi.fn();
    const output = await new InlineTemplateProcessor({ log: logFn }).process(
      input
    );
    expect(output).toMatchInlineSnapshot(`
      "<!--
      %template-in-begin:some-id%
      {% echo hello %}
      %template-in-end:some-id%
      -->

      <!-- %template-out-begin:some-id% -->
      hello
      <!-- %template-out-end:some-id% -->
      "
    `);
    expect(logFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "[some-id:shell] echo hello",
        ],
      ]
    `);
  });
});
