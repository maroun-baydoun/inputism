import type {
  CreateInputismLayoutOptions,
  CreateInputismImageOptions,
  InputismColors,
  InputismImage,
  InputismLayout,
  GridSize,
  MarkMode,
  RgbaImage,
} from "./types";

export const DEFAULT_DENSITY = 36;

// Preserve the source aspect ratio while keeping portrait output compact by default.
export function getGridSize(
  width: number,
  height: number,
  columns: number,
  maxRows = columns,
): GridSize {
  assertPositiveDimension(width, "width");
  assertPositiveDimension(height, "height");
  assertPositiveDimension(columns, "density");
  assertPositiveDimension(maxRows, "maxRows");

  // Density is the number of columns. Multiplying it by height / width gives
  // the number of rows needed to represent the source without stretching it.
  const sourceRows = Math.round((columns * height) / width);
  return {
    columns,
    // maxRows is a safety limit for very tall images. The lower bound keeps
    // extremely wide images from producing a grid with zero rows.
    rows: Math.max(1, Math.min(sourceRows, maxRows)),
  };
}

// Create the stable coordinate system independently from source pixels. A
// renderer can keep this layout while new colors are produced later.
export function createInputismLayout(
  width: number,
  height: number,
  options: CreateInputismLayoutOptions = {},
): InputismLayout {
  const density = options.density ?? DEFAULT_DENSITY;
  const size = getGridSize(width, height, density, options.maxRows ?? density);
  return {
    columns: size.columns,
    rows: size.rows,
    mark: options.mark ?? "indeterminate",
  };
}

// Convert image data into the shared Inputism image language using area averaging.
export function createInputismImage(
  image: RgbaImage,
  options: CreateInputismImageOptions = {},
): InputismImage {
  const layout = createInputismLayout(image.width, image.height, options);
  return {
    ...layout,
    colors: createInputismColors(image, layout),
  };
}

// Sample one RGB color for each cell in an existing layout. This is separate
// from layout creation so a renderer can reuse its structure between updates.
export function createInputismColors(
  image: RgbaImage,
  layout: InputismLayout,
): InputismColors {
  assertImage(image);
  assertLayout(layout);

  // Each cell stores three values: red, green, and blue. Keeping the values in
  // one typed array makes the model compact and easy for different renderers
  // to consume.
  const colors = new Uint8ClampedArray(layout.columns * layout.rows * 3);
  const crop = getCenterCrop(image.width, image.height, layout);

  for (let row = 0; row < layout.rows; row += 1) {
    for (let column = 0; column < layout.columns; column += 1) {
      // Convert the two-dimensional cell coordinate into the start of its RGB
      // triplet in the flat output array.
      const offset = (row * layout.columns + column) * 3;
      colors.set(sampleCellColor(image, crop, column, row, layout), offset);
    }
  }

  return colors;
}

export function getInputismColor(colors: InputismColors, index: number) {
  // A renderer sees each cell as a CSS-compatible color, while the model keeps
  // the underlying values compact as RGB bytes.
  const offset = index * 3;
  return `rgb(${colors[offset]} ${colors[offset + 1]} ${colors[offset + 2]})`;
}

function assertImage(image: RgbaImage) {
  assertPositiveDimension(image.width, "width");
  assertPositiveDimension(image.height, "height");
  // Source pixels are RGBA, so every pixel contributes four values even though
  // the generated model intentionally stores only RGB for each output cell.
  const expectedLength = image.width * image.height * 4;
  if (image.data.length < expectedLength) {
    throw new RangeError(
      `RGBA data must contain at least ${expectedLength} values`,
    );
  }
}

function assertLayout(layout: InputismLayout) {
  assertPositiveDimension(layout.columns, "columns");
  assertPositiveDimension(layout.rows, "rows");
}

function assertPositiveDimension(value: number, name: string) {
  if (!Number.isInteger(value) || value < 1) {
    throw new RangeError(`${name} must be a positive integer`);
  }
}

function getCenterCrop(width: number, height: number, size: GridSize) {
  const sourceRatio = width / height;
  const targetRatio = size.columns / size.rows;
  // Rounding the row count can make the target ratio differ slightly from the
  // source ratio. Crop the longer source dimension instead of distorting it.
  // For a wide source, targetRatio * height gives the crop width. For a tall
  // source, width / targetRatio gives the crop height.
  const cropWidth = sourceRatio > targetRatio ? height * targetRatio : width;
  const cropHeight = sourceRatio > targetRatio ? height : width / targetRatio;
  return {
    x: (width - cropWidth) / 2,
    y: (height - cropHeight) / 2,
    width: cropWidth,
    height: cropHeight,
  };
}

function sampleCellColor(
  image: RgbaImage,
  crop: { x: number; y: number; width: number; height: number },
  column: number,
  row: number,
  size: GridSize,
) {
  // Map the output cell into the corresponding source rectangle. Fractional
  // boundaries let cells cover similar areas when dimensions do not divide
  // evenly.
  const left = crop.x + (column * crop.width) / size.columns;
  const right = crop.x + ((column + 1) * crop.width) / size.columns;
  const top = crop.y + (row * crop.height) / size.rows;
  const bottom = crop.y + ((row + 1) * crop.height) / size.rows;
  // Round outward so no source pixel on a cell boundary is skipped. The
  // max(start + 1, ...) guards the smallest cells against an empty range.
  const startX = Math.max(0, Math.floor(left));
  const endX = Math.min(image.width, Math.max(startX + 1, Math.ceil(right)));
  const startY = Math.max(0, Math.floor(top));
  const endY = Math.min(image.height, Math.max(startY + 1, Math.ceil(bottom)));
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  // Averaging the covered pixels gives the cell a representative color and is
  // the image downsampling step.
  for (let sourceY = startY; sourceY < endY; sourceY += 1) {
    for (let sourceX = startX; sourceX < endX; sourceX += 1) {
      // RGBA data is row-major and uses four values per source pixel.
      const offset = (sourceY * image.width + sourceX) * 4;
      red += Number(image.data[offset]);
      green += Number(image.data[offset + 1]);
      blue += Number(image.data[offset + 2]);
      count += 1;
    }
  }

  return [
    Math.round(red / count),
    Math.round(green / count),
    Math.round(blue / count),
  ];
}

export function isMarkMode(value: string): value is MarkMode {
  return (
    value === "checked" || value === "indeterminate" || value === "background"
  );
}
