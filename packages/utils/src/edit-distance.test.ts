import { describe, expect, it } from "vitest";
import { solveEditDistance } from "./edit-distance";

describe(solveEditDistance, () => {
  it("basic", () => {
    expect(
      solveEditDistance([..."kitten"], [..."sitting"])
    ).toMatchInlineSnapshot("3");
  });
});
