import React from "react";

export function Compose({ elements }: { elements: React.ReactElement[] }) {
  return elements.reduceRight(
    (acc, el) => React.cloneElement(el, {}, acc),
    <></>
  );
}
