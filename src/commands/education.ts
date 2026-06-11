import type { Command } from "../types";
import { profile } from "../content";
import { escapeHtml } from "../utils";

export const education: Command = {
  name: "education",
  description: "where I studied",
  run(_args, ctx) {
    ctx.print();
    for (const entry of profile.education) {
      ctx.printHTML(
        `  <span class="accent">${escapeHtml(entry.degree)}</span> ` +
          `<span class="muted">(${escapeHtml(entry.period)})</span>`,
      );
      ctx.print(`    ${entry.school}`);
      for (const detail of entry.details) ctx.print(`    · ${detail}`);
      ctx.print();
    }
  },
};
