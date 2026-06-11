import "./styles/main.css";
import { Terminal } from "./terminal";
import { commands } from "./commands";

const terminal = new Terminal(
  document.querySelector<HTMLElement>("#terminal")!,
);

void commands.get("banner")!.run([], terminal.ctx);
