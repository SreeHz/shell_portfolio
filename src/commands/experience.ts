import type { Command } from "../types";
import { profile } from "../content";
import { escapeHtml } from "../utils";

export const experience: Command = {
  name: "experience",
  description: "where I've worked",
  run(_args, ctx) {
    ctx.print();
    for (const job of profile.experience) {
      ctx.printHTML(
        `  <span class="accent">${escapeHtml(job.role)}</span> @ ${escapeHtml(job.org)} ` +
          `<span class="muted">(${escapeHtml(job.period)})</span>`,
      );
      for (const point of job.points) ctx.print(`    · ${point}`);
      ctx.print();
    }
  },
};
