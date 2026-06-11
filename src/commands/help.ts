import type { Command } from "../types";

export const help: Command = {
  name: "help",
  description: "list available commands",
  run(_args, ctx) {
    const commands = [...ctx.commands.values()];
    const width = Math.max(...commands.map((c) => c.name.length));
    ctx.print();
    ctx.print("Available commands:");
    ctx.print();
    for (const command of commands) {
      ctx.printHTML(
        `  <span class="accent">${command.name.padEnd(width + 3)}</span>` +
          `<span class="muted">${command.description}</span>`,
      );
    }
    ctx.print();
    ctx.print("Use ↑/↓ for history and Tab to autocomplete.", "muted");
    ctx.print();
  },
};
