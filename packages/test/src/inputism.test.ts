import { describe, expect, it } from "vitest";
import {
  createInputismColors,
  createInputismImage,
  createInputismLayout,
} from "inputism/core";
import { createInputismImageFromSource } from "inputism/source";

describe("createInputismImage", () => {
  it("downsamples RGBA data into the shared image model", () => {
    const image = createInputismImage(
      {
        width: 2,
        height: 2,
        data: new Uint8ClampedArray([
          255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255,
        ]),
      },
      { density: 2, mark: "checked" },
    );

    expect(image.columns).toBe(2);
    expect(image.rows).toBe(2);
    expect(image.mark).toBe("checked");
    expect(Array.from(image.colors)).toEqual([
      255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255,
    ]);
  });

  it("accepts a pluggable RGBA source", async () => {
    const image = await createInputismImageFromSource(
      () => ({
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([12, 34, 56, 255]),
      }),
      { density: 1, mark: "background" },
    );

    expect(image.columns).toBe(1);
    expect(image.rows).toBe(1);
    expect(image.mark).toBe("background");
    expect(Array.from(image.colors)).toEqual([12, 34, 56]);
  });

  it("can create a layout and colors independently", () => {
    const source = {
      width: 2,
      height: 2,
      data: new Uint8ClampedArray([
        255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255,
      ]),
    };
    const layout = createInputismLayout(source.width, source.height, {
      density: 2,
      mark: "checked",
    });
    const colors = createInputismColors(source, layout);

    expect(layout).toEqual({ columns: 2, rows: 2, mark: "checked" });
    expect(Array.from(colors)).toEqual([
      255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255,
    ]);
  });
});
