// Keep source examples separate from the Vite configuration so they can be
// edited as demo content without mixing them with build setup.
export const snippets: Record<string, string> = {
  "quick-start": `<script type="module" src="https://esm.sh/inputism/element"></script>
<inputism-image src="cat.jpg" density="32" mark="checked"></inputism-image>`,
  "local-example": `<inputism-image src="cat.jpg" density="32" mark="checked"></inputism-image>
<inputism-image src="cat.jpg" density="32" mark="indeterminate"></inputism-image>
<inputism-image src="cat.jpg" density="32" mark="background"></inputism-image>`,
  "cross-origin-example": `<inputism-image
  crossorigin="anonymous"
  src="https://images.pexels.com/photos/34574310/pexels-photo-34574310.jpeg"
  density="32"
  mark="checked"
></inputism-image>`,
  "label-example": `<inputism-image
  src="cat2.jpg"
  density="32"
  mark="checked"
  label="A tabby cat lying on a patterned rug"
></inputism-image>`,
  "lazy-example": `<inputism-image
  src="cat4.jpg"
  loading="lazy"
  density="32"
  mark="checked"
></inputism-image>`,
  "load-handler": `import "inputism/element";
import type { InputismElement } from "inputism/element";

const image = document.querySelector<InputismElement>("inputism-image");
const output = document.querySelector<HTMLElement>(".load-example-output");

image?.addEventListener("inputism-load", (event) => {
  const loadedImage = event.detail;
  if (output) {
    output.textContent = \`Loaded \${loadedImage.columns} × \${loadedImage.rows} cells.\`;
  }
});`,
  "raw-html-example": `import { createInputismImageFromUrl } from "inputism/source";
import { renderInputismHtml } from "inputism/html";

const image = await createInputismImageFromUrl("cat.jpg", {
  density: 32,
});
const container = document.querySelector(".raw-html-output");

if (container) {
  renderInputismHtml(container, image, {
    mark: "checked",
    inlineStyles: true,
  });
}`,
  "error-handler": `import "inputism/element";
import type { InputismElement } from "inputism/element";

const image = document.querySelector<InputismElement>("inputism-image");

image?.addEventListener("inputism-error", (event) => {
  const error = event.detail;
  console.error("Inputism could not load the image", error);
});`,
  "encoded-image-html": `<!-- The full base64 value is shortened here. -->
<inputism-image
  src="data:image/jpeg;base64,BASE64_IMAGE_DATA"
  density="32"
  mark="checked"
></inputism-image>
`,
  "encoded-image-js": `// The encoded image can also be assigned from JavaScript.
const encodedImage = "data:image/jpeg;base64,BASE64_IMAGE_DATA";
const element = document.querySelector("inputism-image");
element?.setAttribute("src", encodedImage);`,
  "install-npm": "npm install inputism",
  "install-pnpm": "pnpm add inputism",
  "install-yarn": "yarn add inputism",
};
