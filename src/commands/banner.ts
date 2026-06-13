import type { Command } from "../types";
import { escapeHtml } from "../utils";
import { THEMES } from "./theme";

const START_TIME = Date.now();

// figlet "Standard" font — kept as the art column
const ART = [
  "                                    _   _     ",
  "  _ __ __ _ _____      ____ _ _ __ | |_| |__  ",
  " | '__/ _` / __\\ \\ /\\ / / _` | '_ \\| __| '_ \\ ",
  " | | | (_| \\__ \\\\ V  V / (_| | | | | |_| | | |",
  " |_|  \\__,_|___/ \\_/\\_/ \\__,_|_| |_|\\__|_| |_|",
];

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

// 8 standard ANSI colors shown as colored squares
const COLOR_SWATCHES = [
  "#1f2328", "#f85149", "#39d353", "#e3b341",
  "#58a6ff", "#bc8cff", "#39c5cf", "#c9d1d9",
];

function buildColorRow(): string {
  return COLOR_SWATCHES.map(
    (c) => `<span class="nf-swatch" style="background:${c}"> </span>`,
  ).join("");
}

function row(key: string, value: string): string {
  return `<div><span class="accent nf-key">${escapeHtml(key)}</span>${escapeHtml(value)}</div>`;
}

function rowHTML(key: string, valueHTML: string): string {
  return `<div><span class="accent nf-key">${escapeHtml(key)}</span>${valueHTML}</div>`;
}

export function renderNeofetch(ctx: { printHTML: (h: string) => void; print: (t?: string, c?: string) => void }): void {
  const currentTheme = document.documentElement.dataset.theme ?? "dark";
  const uptime = formatUptime(Date.now() - START_TIME);
  const cores = navigator.hardwareConcurrency;
  const cpuLabel = cores ? `${cores}-core (browser)` : "browser";
  const themeList = [...THEMES].join(", ");

  const artLines = ART.map(
    (l) => `<div class="nf-line">${escapeHtml(l)}</div>`,
  ).join("");

  const sep = "─".repeat(26);

  const infoLines = [
    `<div><span class="accent nf-user">raswanth</span><span class="muted">@</span><span class="accent nf-user">portfolio</span></div>`,
    `<div class="muted">${sep}</div>`,
    row("OS:     ", "Portfolio Linux x86_64"),
    row("Host:   ", "Browser Terminal v2025"),
    row("Kernel: ", "TypeScript 5.x"),
    row("Uptime: ", uptime),
    row("Shell:  ", "/bin/bash 5.2.15"),
    rowHTML("Theme:  ", `${escapeHtml(currentTheme)}  <span class="muted">[${escapeHtml(themeList)}]</span>`),
    row("CPU:    ", cpuLabel),
    `<div> </div>`,
    `<div class="nf-colors">${buildColorRow()}</div>`,
  ].join("");

  ctx.printHTML(`
    <div class="nf-grid">
      <div class="nf-art accent">${artLines}</div>
      <div class="nf-info">${infoLines}</div>
    </div>
  `);
}

export const banner: Command = {
  name: "banner",
  description: "show the welcome banner",
  async run(_args, ctx) {
    renderNeofetch(ctx);
    ctx.print();
    await ctx.type(
      `type help to see what you can do here.`,
      "muted",
    );
    ctx.print();
  },
};
