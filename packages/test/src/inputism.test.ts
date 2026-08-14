import { describe, expect, it } from "vitest";
import { inputism } from "inputism";

describe("inputism package", () => {
  it("exposes the package entry point", () => {
    expect(inputism.name).toBe("inputism");
  });
});
