import type { Command } from "../types";
import { profile } from "../content";
import { link } from "../utils";

export const contact: Command = {
  name: "contact",
  description: "how to reach me",
  run(_args, ctx) {
    ctx.print();
    ctx.printHTML(
      `  <span class="accent">email </span> ${link(`mailto:${profile.email}`, profile.email)}`,
    );
    ctx.printHTML(
      `  <span class="accent">phone </span> ${link(`tel:${profile.phone}`, profile.phone)}`,
    );
    ctx.printHTML(
      `  <span class="accent">github</span> ${link(`https://github.com/${profile.githubUser}`, `github.com/${profile.githubUser}`)}`,
    );
    ctx.print();
    ctx.printHTML(
      `<span class="muted">see also:</span> <span class="accent">socials</span>`,
    );
    ctx.print();
  },
};
