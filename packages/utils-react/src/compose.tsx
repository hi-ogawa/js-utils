import React from "react";

export function Compose(
  props: React.PropsWithChildren<{ elements: React.ReactElement[] }>,
) {
  return props.elements.reduceRight(
    (acc, el) => React.cloneElement(el, {}, acc),
    <>{props.children}</>,
  );
}
