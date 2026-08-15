import "./style.css";

export class SnippetCopyButton extends HTMLElement {
  #clipboardText = "";
  #button: HTMLButtonElement | null = null;
  #label = "Copy";

  #boundClick = async () => {
    if (!this.#button || !this.#clipboardText) {
      return;
    }
    try {
      await navigator.clipboard.writeText(this.#clipboardText);
    } catch {
      this.hidden = true;
      return;
    }
    this.#button.textContent = "Copied";
    window.setTimeout(() => {
      if (this.#button) {
        this.#button.textContent = this.#label;
      }
    }, 1500);
  };

  connectedCallback() {
    if (!navigator.clipboard?.writeText || this.#button) {
      if (!navigator.clipboard?.writeText) {
        this.hidden = true;
      }
      return;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = (this.textContent ?? "Copy").trim() || "Copy";
    this.#label = button.textContent;
    this.replaceChildren(button);
    button.addEventListener("click", this.#boundClick);
    this.#button = button;
  }

  disconnectedCallback() {
    this.#button?.removeEventListener("click", this.#boundClick);
    this.#button = null;
  }

  set clipboardText(value: string) {
    this.#clipboardText = value;
  }
  get clipboardText() {
    return this.#clipboardText;
  }
}

if (!customElements.get("snippet-copy-button")) {
  customElements.define("snippet-copy-button", SnippetCopyButton);
}
