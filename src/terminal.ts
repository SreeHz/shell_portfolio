import { commands } from "./commands";
import type { TerminalContext } from "./types";
import { escapeHtml } from "./utils";
import { CHAOS_RESPONSES } from "./commands/jokes";

const DEFAULT_PROMPT = "raswanth@portfolio:~$";
const GRUB_PROMPT    = "grub rescue>";
let   termSeq        = 0;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

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
  /** Called once when chaos mode activates — wire up desktop effects here. */
  onChaosMode?: () => void;

  private root!: HTMLElement;
  private output!: HTMLElement;
  private input!: HTMLInputElement;
  private promptLabel!: HTMLLabelElement;
  private history: string[] = [];
  private historyIndex = 0;
  private draft = "";
  private running = false;
  private chaosMode = false;
  private currentPrompt = DEFAULT_PROMPT;

  constructor(root: HTMLElement) {
    this.root = root;
    const uid = `cmd-${++termSeq}`;
    root.innerHTML = `
      <div class="output" role="log" aria-live="polite"></div>
      <div class="chips" aria-label="quick commands"></div>
      <form class="input-line">
        <label class="prompt" for="${uid}">${escapeHtml(DEFAULT_PROMPT)}</label>
        <input
          id="${uid}"
          autocomplete="off"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
          aria-label="terminal input"
        />
      </form>
    `;
    this.output      = root.querySelector(".output")!;
    this.input       = root.querySelector("input")!;
    this.promptLabel = root.querySelector("label")!;

    this.ctx = {
      print:    (text = "", className) => this.print(text, className),
      printHTML: (html) => this.printHTML(html),
      type:     (text, className)      => this.typeLine(text, className),
      clear:    () => { this.output.innerHTML = ""; },
      commands,
      activateChaosMode: () => this.activateChaosMode(),
    };

    const chips = root.querySelector<HTMLElement>(".chips")!;
    for (const name of ["help", "about", "projects", "blog", "skills", "resume", "contact"]) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.textContent = name;
      chip.addEventListener("click", () => this.exec(name));
      chips.append(chip);
    }

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
        if (!this.chaosMode) this.autocomplete();
      } else if (event.key === "l" && event.ctrlKey) {
        event.preventDefault();
        this.ctx.clear();
      } else if (event.key === "c" && event.ctrlKey) {
        event.preventDefault();
        this.echoPromptLine(this.input.value + "^C");
        this.input.value = "";
        this.running = false;
      } else if (event.key === "u" && event.ctrlKey) {
        event.preventDefault();
        this.input.value = "";
      }
    });

    root.addEventListener("click", (event) => {
      if ((event.target as Element).closest?.("a, button")) return;
      if (getSelection()?.toString()) return;
      this.input.focus({ preventScroll: true });
    });
    if (!matchMedia("(pointer: coarse)").matches) {
      this.input.focus({ preventScroll: true });
    }
  }

  exec(line: string): void {
    if (this.running) return;
    void this.execute(line);
  }

  private activateChaosMode(): void {
    this.chaosMode = true;
    this.currentPrompt = GRUB_PROMPT;
    this.promptLabel.textContent = GRUB_PROMPT;
    this.promptLabel.classList.add("grub-prompt");
    document.documentElement.dataset.theme = "grub";

    const titleEl = document.querySelector<HTMLElement>(".titlebar-title");
    if (titleEl) {
      titleEl.textContent = "GRUB Rescue Mode  —  Kernel panic: VFS unable to mount root";
      titleEl.style.color = "#aaa";
    }
    const chips = this.root.querySelector<HTMLElement>(".chips");
    if (chips) chips.style.display = "none";

    this.onChaosMode?.();
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

  private async typeLine(text: string, className?: string): Promise<void> {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.print(text, className);
      return;
    }
    const line = document.createElement("div");
    line.className = className ? `line ${className}` : "line";
    this.output.append(line);
    for (const char of text) {
      line.textContent += char;
      this.scrollToBottom();
      await new Promise((resolve) => setTimeout(resolve, 14));
    }
  }

  private echoPromptLine(line: string): void {
    this.printHTML(
      `<span class="prompt ${this.chaosMode ? "grub-prompt" : ""}">${escapeHtml(this.currentPrompt)}</span> ${escapeHtml(line)}`,
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

    // ── GRUB rescue chaos mode ──────────────────────────────────────────────
    if (this.chaosMode) {
      await this.handleChaosCommand(trimmed);
      return;
    }

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

  private async handleChaosCommand(cmd: string): Promise<void> {
    this.running = true;
    try {
      await new Promise((r) => setTimeout(r, 120));

      if (cmd === "reboot" || cmd === "reboot -f") {
        this.print("Rebooting", "muted");
        for (let i = 3; i >= 1; i--) {
          await new Promise((r) => setTimeout(r, 500));
          this.print(`  ${i}...`, "muted");
        }
        await new Promise((r) => setTimeout(r, 700));
        location.reload();
        return;
      }

      if (cmd === "exit" || cmd === "logout") {
        this.print("lol. exit where, exactly? there's no filesystem to exit to.", "muted");
        return;
      }

      if (cmd === "help") {
        this.print("Available commands in rescue mode:", "muted");
        this.print("  reboot    (the only way out)", "muted");
        this.print("  everything else → sarcasm", "muted");
        return;
      }

      const msg = pick(CHAOS_RESPONSES)(cmd);
      this.print(msg, "muted");
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
    const spaceIdx = value.indexOf(" ");

    if (spaceIdx === -1) {
      if (!value) return;
      const matches = [...commands.keys()].filter((name) =>
        name.startsWith(value.toLowerCase()),
      );
      if (matches.length === 0) return;
      if (matches.length === 1) {
        this.input.value = matches[0] + " ";
        return;
      }
      let prefix = matches[0];
      for (const match of matches.slice(1)) {
        while (!match.startsWith(prefix)) prefix = prefix.slice(0, -1);
      }
      this.input.value = prefix;
      this.echoPromptLine(value);
      this.print(matches.join("    "));
    } else {
      const cmdName = value.slice(0, spaceIdx).toLowerCase();
      const cmd = commands.get(cmdName);
      if (!cmd?.complete) return;

      const afterCmd = value.slice(spaceIdx + 1);
      const tokens   = afterCmd.split(/\s+/);
      const partial  = tokens[tokens.length - 1] ?? "";
      const prevTokens = tokens.slice(0, -1);

      const matches = cmd.complete(partial);
      if (matches.length === 0) return;

      if (matches.length === 1) {
        this.input.value = [cmdName, ...prevTokens, matches[0]].join(" ") + " ";
        return;
      }

      let prefix = matches[0];
      for (const match of matches.slice(1)) {
        while (!match.startsWith(prefix)) prefix = prefix.slice(0, -1);
      }
      this.input.value = [cmdName, ...prevTokens, prefix].join(" ");
      this.echoPromptLine(value);
      this.print(matches.join("    "));
    }
  }

  private scrollToBottom(): void {
    this.root.scrollTop = this.root.scrollHeight;
  }
}
