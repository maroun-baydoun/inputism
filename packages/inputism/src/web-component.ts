import { DEFAULT_DENSITY } from "./grid";
import {
  createImageDataSourceFromUrl,
  createInputismImageFromSource,
} from "./image-source";
import { createInputismHtml, getRenderMark } from "./renderer";
import type { InputismHtmlStyles } from "./renderer";
import type { InputismImage } from "./types";

export class InputismElement extends HTMLElement {
  static observedAttributes = [
    "src",
    "mark",
    "density",
    "max-rows",
    "crossorigin",
    "label",
    "loading",
  ];

  private currentImage?: InputismImage;
  private intersectionObserver?: IntersectionObserver;
  private sourceRequest = 0;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    // Attribute values may already exist when a custom element is upgraded.
    // Render any assigned image first, then let the src adapter take over if
    // the element has a source attribute.
    this.render();
    if (this.getAttribute("src")) {
      this.scheduleSourceLoad(true);
    }
  }

  disconnectedCallback() {
    // Invalidate any in-flight source operation so a late image load cannot
    // render into an element that has left the document.
    this.sourceRequest += 1;
    this.disconnectSourceObserver();
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ) {
    if (oldValue === newValue || !this.isConnected) {
      return;
    }

    if (name === "src" || name === "crossorigin") {
      this.scheduleSourceLoad(true);
      return;
    }

    if (name === "density" || name === "max-rows") {
      this.scheduleSourceLoad(true);
      return;
    }

    if (name === "loading") {
      this.scheduleSourceLoad();
      return;
    }

    this.render();
  }

  get image() {
    return this.currentImage;
  }

  set image(value: InputismImage | undefined) {
    this.sourceRequest += 1;
    this.disconnectSourceObserver();
    this.currentImage = value;
    this.render();
  }

  private scheduleSourceLoad(forceReload = false) {
    this.disconnectSourceObserver();

    // forceReload is used after a source-affecting attribute changes. It
    // invalidates pending work and clears the old model before reloading.
    if (forceReload || !this.currentImage) {
      this.sourceRequest += 1;
    }

    if (forceReload) {
      this.currentImage = undefined;
      this.render();
    }

    if (!this.getAttribute("src")) {
      void this.loadSource();
      return;
    }

    if (!forceReload && this.currentImage) {
      return;
    }

    if (this.getAttribute("loading") !== "lazy") {
      void this.loadSource();
      return;
    }

    if (!("IntersectionObserver" in globalThis)) {
      void this.loadSource();
      return;
    }

    // Start slightly before the element enters the viewport so decoding can
    // finish before the visual output becomes visible.
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.disconnectSourceObserver();
          void this.loadSource();
        }
      },
      { rootMargin: "200px" },
    );
    this.intersectionObserver.observe(this);
  }

  private disconnectSourceObserver() {
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = undefined;
  }

  private async loadSource() {
    const source = this.getAttribute("src");
    // Incrementing this token makes rapid src or density changes safe: only
    // the most recent request is allowed to update the component.
    const request = ++this.sourceRequest;
    this.currentImage = undefined;
    this.render();

    if (!source) {
      return;
    }

    try {
      const image = await createInputismImageFromSource(
        createImageDataSourceFromUrl(source, {
          crossOrigin: this.getAttribute("crossorigin") || "anonymous",
        }),
        {
          density: getPositiveIntegerAttribute(
            this,
            "density",
            DEFAULT_DENSITY,
          ),
          maxRows: getOptionalPositiveIntegerAttribute(this, "max-rows"),
          mark: getRenderMark(this.getAttribute("mark"), "indeterminate"),
        },
      );
      if (request !== this.sourceRequest) {
        return;
      }

      this.currentImage = image;
      this.render();
    } catch (error) {
      if (request !== this.sourceRequest) {
        return;
      }

      this.render();
      this.dispatchEvent(
        new CustomEvent("inputism-error", {
          detail: error,
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private render() {
    if (!this.shadowRoot) {
      return;
    }

    if (!this.currentImage) {
      this.shadowRoot.replaceChildren();
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          container-type: inline-size;
        }
      </style>
      <style class="inputism-grid-styles"></style>
      <div class="inputism-content"></div>
    `;
    const content =
      this.shadowRoot.querySelector<HTMLElement>(".inputism-content");
    if (content) {
      const view = createInputismHtml(content, this.currentImage, {
        mark: getRenderMark(this.getAttribute("mark"), this.currentImage.mark),
        label: this.getAttribute("label") ?? undefined,
      });
      view.setColors(this.currentImage.colors);
      const styleElement = this.shadowRoot.querySelector<HTMLStyleElement>(
        ".inputism-grid-styles",
      );
      if (styleElement) {
        styleElement.textContent = createInputismStylesheet(view.styles);
      }
    }
  }
}

function createInputismStylesheet(styles: InputismHtmlStyles) {
  return [
    createCssRule(".inputism-grid", styles.grid),
    createCssRule(".inputism-grid input", styles.cell),
    createCssRule(
      '.inputism-grid input[data-mark="background"]',
      styles.backgroundCell,
    ),
  ].join("\n");
}

function createCssRule(selector: string, properties: Record<string, string>) {
  const declarations = Object.entries(properties)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join("\n");
  return `${selector} {\n${declarations}\n}`;
}

function getPositiveIntegerAttribute(
  element: HTMLElement,
  name: string,
  fallback: number,
) {
  const value = Number(element.getAttribute(name));
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function getOptionalPositiveIntegerAttribute(
  element: HTMLElement,
  name: string,
) {
  const value = Number(element.getAttribute(name));
  return Number.isInteger(value) && value > 0 ? value : undefined;
}

export function defineInputismElement(name = "inputism-image") {
  if (customElements.get(name)) {
    return;
  }
  customElements.define(name, InputismElement);
}
