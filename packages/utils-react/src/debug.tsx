import React from "react";

export function Debug(
  props: { debug: unknown } & JSX.IntrinsicElements["details"],
) {
  const { debug, ...rest } = props;
  return (
    <details {...rest}>
      <summary onClick={() => console.log("[Debug]", debug)}>debug</summary>
      <pre>{JSON.stringify(debug, null, 2)}</pre>
    </details>
  );
}
