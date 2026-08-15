# Inputism

Inputism converts image pixels into a compact model of colored cells. The
preferred way to display that model is the `<inputism-image>` web component.

The library keeps these concerns separate:

1. An input source provides RGBA pixels.
2. The core creates an `InputismImage` from those pixels.
3. A renderer displays the model.

This means an application can use a URL, a data URL, a file decoder, or any
other source that produces RGBA data without changing the image model.

## Install

```bash
npm install inputism
```

[View inputism on npm](https://www.npmjs.com/package/inputism)

## Quick start

Load the web-component entry once. It registers `<inputism-image>` and
includes the default styles:

```html
<script type="module" src="https://esm.sh/inputism/element"></script>

<inputism-image
  src="/cat.jpg"
  density="36"
  mark="indeterminate"
  label="A cat"
></inputism-image>
```

The component accepts these attributes:

| Attribute | Values | Purpose |
| --- | --- | --- |
| `src` | URL, data URL, or blob URL | Image source to decode |
| `density` | Positive integer | Number of columns |
| `mark` | `checked`, `indeterminate`, or `background` | Cell appearance |
| `max-rows` | Positive integer | Upper limit for generated rows |
| `crossorigin` | CORS mode | Request mode for remote images |
| `label` | Text | Accessible name for the internal image |
| `loading` | `lazy` | Wait until the element approaches the viewport |

`label` is a component-specific attribute. The component applies
`role="img"` to its internal grid and uses `label` as that role's
`aria-label`, similar to the relationship between `<img>` and `alt`. The
attribute is not applied to the host element. If it is omitted, the internal
image has no accessible name.

Changing `src`, `density`, or `max-rows` loads the source again. Changing
`mark` updates the rendered cells. Without `loading="lazy"`, sources load as
soon as the component connects. Lazy sources use `IntersectionObserver` and
load when they are near the viewport.

## Supplying encoded image data

`src` also accepts a base64 data URL. This is useful when the application
already has an encoded image:

```ts
const element = document.querySelector("inputism-image");
element?.setAttribute("src", encodedImageDataUrl);
```

Remote URLs must allow anonymous CORS access. If the server is configured for
credentialed requests, use `crossorigin="use-credentials"`.

## Supplying RGBA data

When the application already has pixels, create the shared model directly and
assign it to the component's `image` property:

```ts
import { createInputismImage } from "inputism/core";
import type { InputismElement } from "inputism/element";

const image = createInputismImage(
  {
    width: pixelsWidth,
    height: pixelsHeight,
    data: rgbaPixels,
  },
  {
    density: 36,
    mark: "indeterminate",
  },
);

const element = document.querySelector<InputismElement>("inputism-image");
if (element) {
  element.image = image;
}
```

`RgbaImage.data` is row-major RGBA data: four values per source pixel in
red, green, blue, alpha order. The core downsamples those pixels into the
requested layout.

## Handling errors

The component does not render an error message. If a `src` cannot be loaded,
it emits a bubbling `inputism-error` event. The original error is available as
`event.detail`:

```ts
const element = document.querySelector("inputism-image");

element?.addEventListener("inputism-error", (event) => {
  const error = (event as CustomEvent<unknown>).detail;
  console.error("Inputism could not load the image", error);
});
```

## Core model

Use `inputism/core` when layout creation and pixel sampling need to be
controlled separately:

```ts
import {
  createInputismColors,
  createInputismLayout,
} from "inputism/core";

const layout = createInputismLayout(width, height, {
  density: 36,
  mark: "indeterminate",
});
const colors = createInputismColors(rgbaImage, layout);
```

The layout describes the cell coordinate system:

```ts
{
  columns: 36,
  rows: 24,
  mark: "indeterminate",
}
```

`InputismColors` stores one RGB triplet per cell in a flat
`Uint8ClampedArray`. Its length is `columns * rows * 3`.

The one-step helper returns both parts as an `InputismImage`:

```ts
import { createInputismImage } from "inputism/core";

const image = createInputismImage(rgbaImage, {
  density: 36,
  mark: "checked",
});
```

## Source adapters

Use `inputism/source` to keep image acquisition separate from pixel
transformation:

```ts
import {
  createInputismImageFromSource,
  type ImageDataSource,
} from "inputism/source";

const source: ImageDataSource = async () => ({
  width: pixelsWidth,
  height: pixelsHeight,
  data: rgbaPixels,
});

const image = await createInputismImageFromSource(source, {
  density: 36,
  mark: "checked",
});
```

For browser image URLs, data URLs, and blob URLs, use the included adapter:

```ts
import { createInputismImageFromUrl } from "inputism/source";

const image = await createInputismImageFromUrl("/cat.jpg", {
  density: 36,
});
```

## HTML renderer

`inputism/html` is the lower-level renderer used by the web component. It
creates the grid structure, applies cell colors, and returns the styles needed
to display that structure:

```ts
import { createInputismHtml } from "inputism/html";

const view = createInputismHtml(container, layout);
view.setColors(colors);
view.setColors(nextColors);
```

Set `inlineStyles: true` when the exported HTML should carry its visual rules
directly on the grid and inputs:

```ts
createInputismHtml(container, layout, { inlineStyles: true });
```

With the default options, use `view.styles` to build a stylesheet for the
generated classes. The web component uses this same style object inside its
shadow root.

For a complete model, use the one-step helper:

```ts
import { renderInputismHtml } from "inputism/html";

renderInputismHtml(container, image, {
  mark: "checked",
  inlineStyles: true,
});
```

## Web-component exports

The `inputism/element` entry registers the element when imported:

```ts
import { defineInputismElement } from "inputism/element";

defineInputismElement();
```

It also exports `InputismElement` for applications that need the element class
directly.
