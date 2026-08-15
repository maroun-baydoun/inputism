import "./style.css";

type TabButton = HTMLButtonElement & { hidden: boolean };
type TabPanel = HTMLElement & { hidden: boolean };

export class ChipTabs extends HTMLElement {
  #wired = false;
  #buttons: TabButton[] = [];
  #panels: TabPanel[] = [];

  connectedCallback() {
    if (this.#wired) {
      return;
    }

    const buttons = [...this.querySelectorAll<TabButton>("[data-tab]")];
    const panels = [...this.querySelectorAll<TabPanel>("[data-tab-panel]")];
    if (!buttons.length || !panels.length) {
      return;
    }

    this.#buttons = buttons;
    this.#panels = panels;
    this.#wired = true;
    const tablist = this.querySelector<HTMLElement>("[data-tablist]");
    tablist?.setAttribute("role", "tablist");

    this.#buttons.forEach((button) => {
      const tab = button.dataset.tab;
      button.type = "button";
      button.setAttribute("role", "tab");
      button.tabIndex = -1;
      button.setAttribute("aria-selected", "false");
      if (tab) {
        button.id = `${this.id || "chip-tabs"}-tab-${tab}`;
        button.setAttribute(
          "aria-controls",
          `${this.id || "chip-tabs"}-${tab}`,
        );
      }
      button.addEventListener("click", this.#selectFromEvent);
      button.addEventListener("keydown", this.#selectFromKeydown);
    });

    this.#panels.forEach((panel) => {
      const tab = panel.dataset.tabPanel;
      panel.setAttribute("role", "tabpanel");
      if (tab) {
        panel.id = `${this.id || "chip-tabs"}-${tab}`;
        panel.setAttribute(
          "aria-labelledby",
          `${this.id || "chip-tabs"}-tab-${tab}`,
        );
      }
    });

    this.#setActiveTab(
      this.dataset.defaultTab ?? this.#buttons[0]?.dataset.tab ?? "",
    );
  }

  disconnectedCallback() {
    this.#buttons.forEach((button) => {
      button.removeEventListener("click", this.#selectFromEvent);
      button.removeEventListener("keydown", this.#selectFromKeydown);
    });
    this.#wired = false;
  }

  #selectFromEvent = (event: MouseEvent) => {
    const tab = (event.currentTarget as TabButton).dataset.tab;
    if (tab) {
      this.#setActiveTab(tab);
    }
  };

  #selectFromKeydown = (event: KeyboardEvent) => {
    const currentIndex = this.#buttons.findIndex(
      (button) => button === event.currentTarget,
    );
    if (currentIndex === -1) {
      return;
    }

    const lastIndex = this.#buttons.length - 1;
    let nextIndex = currentIndex;
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
        break;
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = lastIndex;
        break;
      default:
        return;
    }

    event.preventDefault();
    const nextButton = this.#buttons[nextIndex];
    const tab = nextButton.dataset.tab;
    if (tab) {
      nextButton.focus();
      this.#setActiveTab(tab);
    }
  };

  #setActiveTab(tab: string) {
    this.#buttons.forEach((button) => {
      const active = button.dataset.tab === tab;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    this.#panels.forEach((panel) => {
      panel.dataset.active = String(panel.dataset.tabPanel === tab);
    });
  }
}

if (!customElements.get("chip-tabs")) {
  customElements.define("chip-tabs", ChipTabs);
}
