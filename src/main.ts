import "./styles/main.css";
import { Terminal } from "./terminal";

const terminal = new Terminal(document.querySelector<HTMLElement>("#terminal")!);

terminal.ctx.print("Welcome to Raswanth's portfolio.");
terminal.ctx.printHTML(
  `Type <span class="accent">help</span> to see available commands.`,
);
terminal.ctx.print();
