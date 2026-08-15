import "./style.css";
import "./components/chip-tabs";
import "./components/copyright-year";
import "./components/snippet-copy-button";
import "./components/snippet-card";
import "inputism/element";
import { loadEncodedImage } from "./encoded-image";
import { renderInputismHtml } from "inputism/html";
import { createInputismImageFromUrl } from "inputism/source";

const densityRange = document.querySelector<HTMLInputElement>(".density-range");
const densityValue =
  document.querySelector<HTMLOutputElement>(".density-value");
const examples = [
  ...document.querySelectorAll<HTMLElement>(
    ".inputism-examples inputism-image",
  ),
];
const errorExample = document.querySelector<HTMLElement>(
  ".error-example-image",
);
const errorOutput = document.querySelector<HTMLElement>(
  ".error-example-output",
);
const rawHtmlOutput = document.querySelector<HTMLElement>(".raw-html-output");
const encodedImageElements = [
  ...document.querySelectorAll<HTMLElement>(
    ".encoded-source-image, .encoded-example-image",
  ),
];

void loadEncodedImage("/cat3.jpg").then((encodedImage) => {
  encodedImageElements.forEach((element) => {
    element.setAttribute("src", encodedImage);
  });
});

if (rawHtmlOutput) {
  void createInputismImageFromUrl("/cat.jpg", { density: 32 }).then((image) => {
    renderInputismHtml(rawHtmlOutput, image, {
      mark: "checked",
      inlineStyles: true,
    });
  });
}

densityRange?.addEventListener("input", () => {
  const density = densityRange.value;
  if (densityValue) {
    densityValue.value = density;
  }
  examples.forEach((example) => {
    example.setAttribute("density", density);
  });
});

errorExample?.addEventListener("inputism-error", (event) => {
  const error = (event as CustomEvent<unknown>).detail;
  errorOutput?.setAttribute("data-state", "error");
  if (errorOutput) {
    errorOutput.textContent = `Caught inputism-error: ${
      error instanceof Error ? error.message : "The image could not be loaded"
    }`;
  }
});
