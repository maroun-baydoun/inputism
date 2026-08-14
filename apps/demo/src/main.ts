import "./style.css";
import { inputism } from "inputism";

const shell = document.querySelector<HTMLElement>(".demo-shell");
if (shell) {
  shell.dataset.library = inputism.name;
}
