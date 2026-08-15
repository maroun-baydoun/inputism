export type MarkMode = "checked" | "indeterminate" | "background";

// The core accepts any RGBA-like buffer, so callers do not need to use browser ImageData.
export type RgbaImage = {
  // Values are ordered as red, green, blue, alpha for each row-major pixel.
  data: ArrayLike<number>;
  width: number;
  height: number;
};

export type InputismColors = Uint8ClampedArray<ArrayBuffer>;

// This is Inputism's renderer-neutral image language. Sources produce it and
// HTML, SVG, canvas, or other renderers can consume it independently.
export type InputismLayout = {
  // columns and rows describe the rectangular coordinate system shared by all
  // renderers.
  columns: number;
  rows: number;
  mark: MarkMode;
};

export type InputismImage = InputismLayout & {
  // The expected length is columns * rows * 3. Cell n begins at n * 3.
  colors: InputismColors;
};

export type CreateInputismLayoutOptions = {
  density?: number;
  mark?: MarkMode;
  maxRows?: number;
};

export type CreateInputismImageOptions = CreateInputismLayoutOptions;

export type CreateInputismImageFromSourceOptions =
  CreateInputismImageOptions & {
    crossOrigin?: string;
    maxImageDimension?: number;
  };

// A source adapter can come from a URL, File, canvas, or any other input. It
// may do asynchronous decoding before returning RGBA data.
export type ImageDataSource = () => RgbaImage | Promise<RgbaImage>;

// Renderers share this shape while choosing their own target and options.
export type ImageRenderer<TTarget, TResult = TTarget, TOptions = undefined> = (
  target: TTarget,
  image: InputismImage,
  options?: TOptions,
) => TResult;

export type GridSize = {
  columns: number;
  rows: number;
};
