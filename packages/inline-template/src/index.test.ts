import { describe, expect, it, vi } from "vitest";
import { InlineTemplateProcessor } from ".";

describe(InlineTemplateProcessor, () => {
  it("basic", async () => {
    const input = `\
<!--
%template-input-start:some-id%
{%shell echo hello %}
%template-input-end:some-id%
-->

<!-- %template-output-start:some-id% -->
anything here will be overwritten
<!-- %template-output-end:some-id% -->
`;
    const logFn = vi.fn();
    const output = await new InlineTemplateProcessor({ log: logFn }).process(
      input
    );
    expect(output).toMatchInlineSnapshot(`
      "<!--
      %template-input-start:some-id%
      {%shell echo hello %}
      %template-input-end:some-id%
      -->

      <!-- %template-output-start:some-id% -->
      hello
      <!-- %template-output-end:some-id% -->
      "
    `);
    expect(logFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "* processing {%shell echo hello %}",
        ],
      ]
    `);
  });

  it("error", async () => {
    const input = `\
<!--
%template-input-start:some-id%
{%shell node -hhelp %}
%template-input-end:some-id%
-->

<!-- %template-output-start:some-id% -->
anything here will be overwritten
<!-- %template-output-end:some-id% -->
`;
    const logFn = vi.fn();
    const output = await new InlineTemplateProcessor({ log: logFn }).process(
      input
    );
    expect(output).toMatchInlineSnapshot(`
      "<!--
      %template-input-start:some-id%
      {%shell node -hhelp %}
      %template-input-end:some-id%
      -->

      <!-- %template-output-start:some-id% -->

      <!-- %template-output-end:some-id% -->
      "
    `);
    expect(logFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "* processing {%shell node -hhelp %}",
        ],
        [
          "** exitCode: 9",
        ],
        [
          "** stderr **
      node: bad option: -hhelp
      ",
        ],
      ]
    `);
  });
});
