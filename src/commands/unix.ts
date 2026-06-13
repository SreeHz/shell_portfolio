import type { Command } from "../types";
import { renderNeofetch } from "./banner";
import { escapeHtml } from "../utils";

const START_TIME = Date.now();

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s} seconds`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ${s % 60} sec`;
  return `${Math.floor(m / 60)} hr ${m % 60} min`;
}

export const whoami: Command = {
  name: "whoami",
  description: "print current user",
  run(_args, ctx) {
    ctx.print("raswanth");
  },
};

export const pwd: Command = {
  name: "pwd",
  description: "print working directory",
  run(_args, ctx) {
    ctx.print("/home/raswanth/portfolio");
  },
};

export const uname: Command = {
  name: "uname",
  description: "print system information",
  run(args, ctx) {
    const all = args.includes("-a") || args.includes("--all");
    if (all) {
      ctx.print("Portfolio Linux portfolio 5.15.0-typescript-x86_64 #1 SMP TypeScript 5.x GNU/Linux");
    } else {
      ctx.print("Portfolio Linux");
    }
  },
};

export const date: Command = {
  name: "date",
  description: "print current date and time",
  run(_args, ctx) {
    ctx.print(new Date().toString());
  },
};

export const uptime: Command = {
  name: "uptime",
  description: "show how long this session has been running",
  run(_args, ctx) {
    const ms = Date.now() - START_TIME;
    ctx.print(
      ` ${new Date().toLocaleTimeString()}  up ${formatUptime(ms)},  1 user,  load average: 0.00, 0.00, 0.00`,
    );
  },
};

export const echo: Command = {
  name: "echo",
  description: "print text",
  usage: "echo <text>",
  run(args, ctx) {
    ctx.print(args.join(" "));
  },
};

export const ls: Command = {
  name: "ls",
  description: "list available commands",
  run(_args, ctx) {
    const names = [...ctx.commands.keys()].sort();
    const colW = Math.max(...names.map((n) => n.length)) + 3;
    const cols = Math.max(1, Math.floor(72 / colW));
    const rows: string[] = [];
    for (let i = 0; i < names.length; i += cols) {
      rows.push(
        names
          .slice(i, i + cols)
          .map((n) => `<span class="accent">${escapeHtml(n.padEnd(colW))}</span>`)
          .join(""),
      );
    }
    ctx.print();
    for (const row of rows) ctx.printHTML(`  ${row}`);
    ctx.print();
  },
};

export const neofetch: Command = {
  name: "neofetch",
  description: "show system info (like the real thing)",
  run(_args, ctx) {
    ctx.print();
    renderNeofetch(ctx);
    ctx.print();
  },
};
