export interface TerminalContext {
  /** Print a line of plain text (safely escaped). */
  print(text?: string, className?: string): void;
  /** Print a line of trusted HTML — never pass user input through this. */
  printHTML(html: string): void;
  clear(): void;
  commands: ReadonlyMap<string, Command>;
}

export interface Command {
  name: string;
  description: string;
  usage?: string;
  run(args: string[], ctx: TerminalContext): void | Promise<void>;
}
