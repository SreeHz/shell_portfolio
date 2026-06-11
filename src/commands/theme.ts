import type { Command } from "../types";

export const THEMES = ["dark", "light", "dracula", "gruvbox", "matrix"] as const;

const STORAGE_KEY = "theme";

export function applyTheme(name: string): void {
  if (name === "dark") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = name;
}

export function restoreTheme(): void {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (THEMES as readonly string[]).includes(saved)) {
      applyTheme(saved);
    }
  } catch {
    // localStorage unavailable (privacy mode) — keep the default theme
  }
}

export const theme: Command = {
  name: "theme",
  description: "switch color theme — try: theme dracula",
  usage: "theme [name]",
  run(args, ctx) {
    if (args.length === 0) {
      const current = document.documentElement.dataset.theme ?? "dark";
      ctx.print();
      for (const name of THEMES) {
        ctx.printHTML(
          `  <span class="accent">${name}</span>` +
            (name === current ? ` <span class="muted">(current)</span>` : ""),
        );
      }
      ctx.print();
      ctx.printHTML(
        `<span class="muted">switch with</span> <span class="accent">theme &lt;name&gt;</span>`,
      );
      ctx.print();
      return;
    }

    const name = args[0].toLowerCase();
    if (!(THEMES as readonly string[]).includes(name)) {
      ctx.print(`unknown theme: ${name}`, "error");
      ctx.print(`available: ${THEMES.join(", ")}`, "muted");
      return;
    }
    applyTheme(name);
    try {
      localStorage.setItem(STORAGE_KEY, name);
    } catch {
      // not persisted, but still applied for this visit
    }
    ctx.print(`theme set to ${name}`);
    ctx.print();
  },
};
