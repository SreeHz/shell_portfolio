import type { Command } from "../types";
import { profile } from "../content";
import { escapeHtml } from "../utils";

export const skills: Command = {
  name: "skills",
  description: "what I work with",
  run(_args, ctx) {
    const width = Math.max(...profile.skills.map((g) => g.category.length));
    ctx.print();
    for (const group of profile.skills) {
      ctx.printHTML(
        `  <span class="accent">${escapeHtml(group.category.padEnd(width + 3))}</span>` +
          escapeHtml(group.items.join(", ")),
      );
    }
    ctx.print();
  },
};
