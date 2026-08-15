import { defineInputismElement, InputismElement } from "./web-component";

// Loading this entry is enough to make <inputism-image> available. The
// registration helper is idempotent, so explicit registration remains safe.
defineInputismElement();

export { defineInputismElement, InputismElement };

export type { InputismImage } from "./types";
