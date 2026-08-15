import "./style.css";

export class CopyrightYear extends HTMLElement {
  connectedCallback() {
    const currentYear = String(new Date().getFullYear());
    if (this.textContent?.trim() !== currentYear) {
      this.textContent = currentYear;
    }
  }
}

if (!customElements.get("copyright-year")) {
  customElements.define("copyright-year", CopyrightYear);
}
