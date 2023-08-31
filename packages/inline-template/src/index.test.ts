import { describe, expect, it } from "vitest";
import { InlineTemplateProcessor } from ".";

describe(InlineTemplateProcessor, () => {
  it("basic", () => {
    const input = `\
<!--
%template-in-begin:x%
{% echo hello %}
%template-in-end:x%
-->

<!-- %template-out-begin:x% -->
anything here will be overwritten
<!-- %template-out-end:x% -->
`;
    const output = new InlineTemplateProcessor().process(input);
    expect(output).toMatchInlineSnapshot(`
      "<!--
      %template-in-begin:x%
      {% echo hello %}
      %template-in-end:x%
      -->

      <!-- %template-out-begin:x% -->
      hello
      <!-- %template-out-end:x% -->
      "
    `);
  });
});
