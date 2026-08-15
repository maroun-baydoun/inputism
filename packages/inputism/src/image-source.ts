import { createInputismImage } from "./grid";
import type {
  CreateInputismImageFromSourceOptions,
  ImageDataSource,
  InputismImage,
  RgbaImage,
} from "./types";

export const DEFAULT_MAX_IMAGE_DIMENSION = 1600;

// Run a pluggable source adapter and turn its data into the shared image model.
export async function createInputismImageFromSource(
  source: ImageDataSource,
  options: CreateInputismImageFromSourceOptions = {},
): Promise<InputismImage> {
  // The source is deliberately called here rather than inside the transform.
  // That keeps acquiring pixels independent from interpreting those pixels.
  const image = await source();
  return createInputismImage(image, {
    density: options.density,
    mark: options.mark,
    maxRows: options.maxRows,
  });
}

// Convenience source adapter for browser-supported URLs, data URLs, and blob URLs.
export function createImageDataSourceFromUrl(
  source: string,
  options: Pick<
    CreateInputismImageFromSourceOptions,
    "crossOrigin" | "maxImageDimension"
  > = {},
): ImageDataSource {
  // Return a lazy adapter. Creating the adapter does not start a network
  // request; the request begins only when createInputismImageFromSource calls it.
  return () => loadImageAsRgba(source, options);
}

// Convenience function for consumers that do not need to keep the source adapter.
export async function createInputismImageFromUrl(
  source: string,
  options: CreateInputismImageFromSourceOptions = {},
): Promise<InputismImage> {
  return createInputismImageFromSource(
    createImageDataSourceFromUrl(source, options),
    options,
  );
}

// Decode an image source and reduce it before reading pixels. The cell model
// does not need the full resolution of a large source image, and this keeps canvas
// memory use reasonable on mobile devices.
async function loadImageAsRgba(
  source: string,
  options: Pick<
    CreateInputismImageFromSourceOptions,
    "crossOrigin" | "maxImageDimension"
  >,
): Promise<RgbaImage> {
  const crossOrigin = options.crossOrigin || "anonymous";
  const maxDimension = options.maxImageDimension ?? DEFAULT_MAX_IMAGE_DIMENSION;

  if (!Number.isInteger(maxDimension) || maxDimension < 1) {
    throw new RangeError("maxImageDimension must be a positive integer");
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = crossOrigin;
    image.onload = () => {
      try {
        // Large source images contain far more pixels than a small cell model
        // needs. Keep smaller images at native size, otherwise scale both axes
        // by the same factor so the source aspect ratio is preserved.
        const scale = Math.min(
          1,
          maxDimension / Math.max(image.naturalWidth, image.naturalHeight),
        );
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Inputism could not create a 2D canvas context");
        }

        // Drawing at the reduced dimensions performs an inexpensive first
        // downsample before the grid sampler averages pixels per cell.
        context.drawImage(image, 0, 0, width, height);
        resolve({
          data: context.getImageData(0, 0, width, height).data,
          width,
          height,
        });
      } catch (error) {
        reject(error);
      }
    };
    image.onerror = () =>
      reject(new Error(`Inputism could not load image: ${source}`));
    image.src = source;
  });
}
