export interface TerminalContext {
  /** Print a line of plain text (safely escaped). */
  print(text?: string, className?: string): void;
  /** Print a line of trusted HTML — never pass user input through this. */
  printHTML(html: string): void;
  /** Print a line with a typewriter animation (instant if reduced motion). */
  type(text: string, className?: string): Promise<void>;
  clear(): void;
  commands: ReadonlyMap<string, Command>;
  /** Trigger the GRUB rescue chaos mode. */
  activateChaosMode(): void;
}

export interface Command {
  name: string;
  description: string;
  usage?: string;
  run(args: string[], ctx: TerminalContext): void | Promise<void>;
  /** Return candidate completions for the current partial argument. */
  complete?(partial: string): string[];
}
