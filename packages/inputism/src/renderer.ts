import { getInputismColor, isMarkMode } from "./grid";
import type {
  InputismColors,
  InputismImage,
  InputismLayout,
  MarkMode,
} from "./types";

export type RenderInputismHtmlOptions = {
  mark?: MarkMode;
  label?: string;
  inlineStyles?: boolean;
};

export type InputismStyleProperties = Record<string, string>;

export type InputismHtmlStyles = {
  grid: InputismStyleProperties;
  cell: InputismStyleProperties;
  backgroundCell: InputismStyleProperties;
};

export type InputismHtmlView = {
  element: HTMLElement;
  styles: InputismHtmlStyles;
  setColors(colors: InputismColors): void;
};

// Build the HTML structure for a layout once. Later color updates only touch
// CSS custom properties on the existing inputs.
export function createInputismHtml(
  container: HTMLElement,
  layout: InputismLayout,
  options: RenderInputismHtmlOptions = {},
): InputismHtmlView {
  const gridElement = document.createElement("div");
  const mark = options.mark ?? layout.mark;
  const cells: HTMLInputElement[] = [];
  const styles = createInputismHtmlStyles(layout);

  gridElement.className = "inputism-grid";
  gridElement.setAttribute("role", "img");
  if (options.label) {
    gridElement.setAttribute("aria-label", options.label);
  }
  if (options.inlineStyles) {
    applyStyleProperties(gridElement, styles.grid);
  }

  // Build cells in a fragment so the live grid is updated only once after all
  // inputs have been configured.
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < layout.columns * layout.rows; index += 1) {
    const cell = document.createElement("input");
    cell.type = "checkbox";
    cell.tabIndex = -1;
    cell.setAttribute("aria-hidden", "true");
    cell.dataset.mark = mark;
    cell.style.setProperty("--inputism-cell-color", "transparent");
    if (options.inlineStyles) {
      applyStyleProperties(cell, styles.cell);
      if (mark === "background") {
        applyStyleProperties(cell, styles.backgroundCell);
      }
    }
    cell.checked = mark === "checked";
    cell.indeterminate = mark === "indeterminate";
    cells.push(cell);
    fragment.append(cell);
  }

  gridElement.append(fragment);
  container.replaceChildren(gridElement);

  return {
    element: gridElement,
    styles,
    setColors(colors) {
      const expectedLength = layout.columns * layout.rows * 3;
      if (colors.length !== expectedLength) {
        throw new RangeError(
          `Inputism colors must contain exactly ${expectedLength} values`,
        );
      }

      // Updating only the custom property lets the browser retain the cell
      // elements and recalculate their native mark color in place.
      cells.forEach((cell, index) => {
        cell.style.setProperty(
          "--inputism-cell-color",
          getInputismColor(colors, index),
        );
      });
    },
  };
}

function createInputismHtmlStyles(layout: InputismLayout): InputismHtmlStyles {
  // Native checkbox marks have built-in whitespace. Scale them down slightly
  // at lower densities so neighboring cells do not visually collide. Compute
  // the final value here so both inline styles and a generated stylesheet use
  // the same browser-compatible value.
  const markScale = String(
    Math.min(0.95, Math.max(0.6, 1.1 - layout.columns * 0.01)),
  );

  return {
    grid: {
      display: "grid",
      width: "100%",
      "aspect-ratio": `${layout.columns} / ${layout.rows}`,
      "grid-template-columns": `repeat(${layout.columns}, minmax(0, 1fr))`,
      "grid-template-rows": `repeat(${layout.rows}, minmax(0, 1fr))`,
    },
    cell: {
      width: "100%",
      height: "100%",
      "min-width": "0",
      "min-height": "0",
      margin: "0",
      "accent-color": "var(--inputism-cell-color)",
      "pointer-events": "none",
      transform: `scale(${markScale})`,
    },
    backgroundCell: {
      appearance: "none",
      transform: "none",
      border: "0",
      background: "var(--inputism-cell-color)",
    },
  };
}

function applyStyleProperties(
  element: HTMLElement,
  properties: InputismStyleProperties,
) {
  Object.entries(properties).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
}

// Render the shared Inputism image model into ordinary HTML without owning the
// surrounding document.
export function renderInputismHtml(
  container: HTMLElement,
  image: InputismImage,
  options: RenderInputismHtmlOptions = {},
) {
  const view = createInputismHtml(container, image, options);
  view.setColors(image.colors);
  return view.element;
}

export function getRenderMark(
  value: string | null,
  fallback: MarkMode,
): MarkMode {
  return value && isMarkMode(value) ? value : fallback;
}
