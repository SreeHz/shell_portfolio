import type { Command } from "../types";
import { profile } from "../content";
import { escapeHtml, link } from "../utils";

export const socials: Command = {
  name: "socials",
  description: "find me elsewhere",
  run(_args, ctx) {
    const width = Math.max(...profile.socials.map((s) => s.label.length));
    ctx.print();
    for (const social of profile.socials) {
      ctx.printHTML(
        `  <span class="accent">${escapeHtml(social.label.padEnd(width + 3))}</span>` +
          link(social.url, social.url.replace(/^(https:\/\/|mailto:)/, "")),
      );
    }
    ctx.print();
  },
};
