import "./styles/main.css";
import { Terminal } from "./terminal";
import { commands } from "./commands";
import { restoreTheme } from "./commands/theme";

restoreTheme();

const terminal = new Terminal(
  document.querySelector<HTMLElement>("#terminal")!,
);

void commands.get("banner")!.run([], terminal.ctx);
