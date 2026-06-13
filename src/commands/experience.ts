import type { Command } from "../types";
import { profile } from "../content";
import { escapeHtml } from "../utils";

export const experience: Command = {
  name: "experience",
  description: "where I've worked",
  run(_args, ctx) {
    const tableRows = profile.experience
      .map(
        (job) =>
          `<tr>
            <td><span class="accent">${escapeHtml(job.role)}</span></td>
            <td>${escapeHtml(job.org)}</td>
            <td class="muted" style="white-space:nowrap">${escapeHtml(job.period)}</td>
          </tr>`,
      )
      .join("");

    const details = profile.experience
      .map(
        (job) =>
          `<div class="exp-detail">
            <div class="exp-detail-hd">${escapeHtml(job.role)} <span class="muted">@ ${escapeHtml(job.org)}</span></div>
            ${job.points.map((p) => `<div class="exp-bullet">· ${escapeHtml(p)}</div>`).join("")}
          </div>`,
      )
      .join("");

    ctx.print();
    ctx.printHTML(
      `<table class="cmd-table">
        <thead><tr><th>Role</th><th>Company</th><th>Period</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
      <div class="exp-details">${details}</div>`,
    );
    ctx.print();
  },
};
