import { commands } from "./commands";
import type { TerminalContext } from "./types";
import { escapeHtml } from "./utils";

const PROMPT = "raswanth@portfolio:~$";

function levenshtein(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dist = Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      dist[i][j] = Math.min(
        dist[i - 1][j] + 1,
        dist[i][j - 1] + 1,
        dist[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dist[a.length][b.length];
}

export class Terminal {
  readonly ctx: TerminalContext;

  private output!: HTMLElement;
  private input!: HTMLInputElement;
  private history: string[] = [];
  private historyIndex = 0; // history.length means "not navigating"
  private draft = "";
  private running = false;

  constructor(root: HTMLElement) {
    root.innerHTML = `
      <div class="output" role="log" aria-live="polite"></div>
      <form class="input-line">
        <label class="prompt" for="cmd">${escapeHtml(PROMPT)}</label>
        <input
          id="cmd"
          autocomplete="off"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
          aria-label="terminal input"
        />
      </form>
    `;
    this.output = root.querySelector(".output")!;
    this.input = root.querySelector("input")!;

    this.ctx = {
      print: (text = "", className) => this.print(text, className),
      printHTML: (html) => this.printHTML(html),
      clear: () => {
        this.output.innerHTML = "";
      },
      commands,
    };

    root.querySelector("form")!.addEventListener("submit", (event) => {
      event.preventDefault();
      if (this.running) return;
      const line = this.input.value;
      this.input.value = "";
      void this.execute(line);
    });

    this.input.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        this.navigateHistory(-1);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        this.navigateHistory(1);
      } else if (event.key === "Tab") {
        event.preventDefault();
        this.autocomplete();
      } else if (event.key === "l" && event.ctrlKey) {
        event.preventDefault();
        this.ctx.clear();
      }
    });

    // Click anywhere focuses the prompt — unless the user is selecting text.
    document.addEventListener("click", () => {
      if (getSelection()?.toString()) return;
      this.input.focus({ preventScroll: true });
    });
    this.input.focus({ preventScroll: true });
  }

  private print(text = "", className?: string): void {
    const line = document.createElement("div");
    line.className = className ? `line ${className}` : "line";
    line.textContent = text || " ";
    this.output.append(line);
    this.scrollToBottom();
  }

  private printHTML(html: string): void {
    const line = document.createElement("div");
    line.className = "line";
    line.innerHTML = html;
    this.output.append(line);
    this.scrollToBottom();
  }

  private echoPromptLine(line: string): void {
    this.printHTML(
      `<span class="prompt">${escapeHtml(PROMPT)}</span> ${escapeHtml(line)}`,
    );
  }

  private async execute(line: string): Promise<void> {
    this.echoPromptLine(line);
    const trimmed = line.trim();
    if (!trimmed) return;

    if (this.history[this.history.length - 1] !== trimmed) {
      this.history.push(trimmed);
    }
    this.historyIndex = this.history.length;
    this.draft = "";

    const [name, ...args] = trimmed.split(/\s+/);
    const command = commands.get(name.toLowerCase());
    if (!command) {
      this.unknownCommand(name);
      return;
    }

    this.running = true;
    try {
      await command.run(args, this.ctx);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.print(`error: ${message}`, "error");
    } finally {
      this.running = false;
      this.scrollToBottom();
    }
  }

  private unknownCommand(name: string): void {
    this.print(`command not found: ${name}`, "error");
    const closest = [...commands.keys()]
      .map((candidate) => ({
        candidate,
        distance: levenshtein(name.toLowerCase(), candidate),
      }))
      .sort((a, b) => a.distance - b.distance)[0];
    if (closest && closest.distance <= 2) {
      this.printHTML(
        `did you mean <span class="accent">${closest.candidate}</span>?`,
      );
    }
    this.printHTML(
      `type <span class="accent">help</span> to see available commands`,
    );
  }

  private navigateHistory(direction: -1 | 1): void {
    if (this.history.length === 0) return;
    if (this.historyIndex === this.history.length) {
      this.draft = this.input.value;
    }
    const next = this.historyIndex + direction;
    if (next < 0 || next > this.history.length) return;
    this.historyIndex = next;
    this.input.value =
      next === this.history.length ? this.draft : this.history[next];
    const end = this.input.value.length;
    this.input.setSelectionRange(end, end);
  }

  private autocomplete(): void {
    const value = this.input.value;
    // Only complete the command itself (first word).
    if (value === "" || /\s/.test(value)) return;

    const matches = [...commands.keys()].filter((name) =>
      name.startsWith(value.toLowerCase()),
    );
    if (matches.length === 0) return;
    if (matches.length === 1) {
      this.input.value = `${matches[0]} `;
      return;
    }

    // Extend to the longest common prefix, then show the options.
    let prefix = matches[0];
    for (const match of matches.slice(1)) {
      while (!match.startsWith(prefix)) prefix = prefix.slice(0, -1);
    }
    this.input.value = prefix;
    this.echoPromptLine(value);
    this.print(matches.join("    "));
  }

  private scrollToBottom(): void {
    window.scrollTo(0, document.body.scrollHeight);
  }
}
