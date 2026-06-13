import type { Command } from "../types";
import { profile } from "../content";
import { escapeHtml } from "../utils";

export const skills: Command = {
  name: "skills",
  description: "what I work with",
  run(_args, ctx) {
    const rows = profile.skills
      .map(
        (g) =>
          `<tr>
            <td><span class="accent">${escapeHtml(g.category)}</span></td>
            <td>${escapeHtml(g.items.join(", "))}</td>
          </tr>`,
      )
      .join("");

    ctx.print();
    ctx.printHTML(
      `<table class="cmd-table">
        <thead><tr><th>Category</th><th>Skills</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`,
    );
    ctx.print();
  },
};
