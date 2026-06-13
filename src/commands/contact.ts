import type { Command } from "../types";
import { profile } from "../content";
import { escapeHtml, link } from "../utils";

export const contact: Command = {
  name: "contact",
  description: "how to reach me",
  run(_args, ctx) {
    // Build merged list: direct fields first, then any socials not already covered
    const directLabels = new Set(["email", "phone", "github"]);
    const extraSocials = profile.socials.filter(
      (s) => !directLabels.has(s.label.toLowerCase()),
    );

    const rows = [
      `<tr><td class="accent">email</td><td>${link(`mailto:${profile.email}`, profile.email)}</td></tr>`,
      `<tr><td class="accent">phone</td><td>${link(`tel:${profile.phone}`, profile.phone)}</td></tr>`,
      `<tr><td class="accent">github</td><td>${link(`https://github.com/${profile.githubUser}`, `github.com/${profile.githubUser}`)}</td></tr>`,
      ...extraSocials.map(
        (s) =>
          `<tr><td class="accent">${escapeHtml(s.label)}</td><td>${link(s.url, s.url.replace(/^(https?:\/\/|mailto:)/, ""))}</td></tr>`,
      ),
    ].join("");

    ctx.print();
    ctx.printHTML(
      `<table class="cmd-table">
        <thead><tr><th>Channel</th><th>Address</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`,
    );
    ctx.print();
  },
};
