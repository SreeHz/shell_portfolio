import type { Command } from "../types";
import { projects } from "../content";
import { escapeHtml, link } from "../utils";

export const projectsCommand: Command = {
  name: "projects",
  description: "things I've built — try: projects <name>",
  usage: "projects [name]",
  run(args, ctx) {
    ctx.print();
    if (args.length > 0) {
      showDetail(args.join(" ").toLowerCase(), ctx);
    } else {
      const width = Math.max(...projects.map((p) => p.name.length));
      for (const project of projects) {
        ctx.printHTML(
          `  <span class="accent">${escapeHtml(project.name.padEnd(width + 3))}</span>` +
            `<span class="muted">${escapeHtml(project.description)}</span>`,
        );
      }
      ctx.print();
      ctx.printHTML(
        `<span class="muted">run</span> <span class="accent">projects &lt;name&gt;</span> ` +
          `<span class="muted">for details, e.g.</span> <span class="accent">projects ${escapeHtml(projects[0].name)}</span>`,
      );
    }
    ctx.print();
  },
};

function showDetail(query: string, ctx: Parameters<Command["run"]>[1]): void {
  const project =
    projects.find((p) => p.name.toLowerCase() === query) ??
    projects.find((p) => p.name.toLowerCase().startsWith(query)) ??
    projects.find((p) => p.name.toLowerCase().includes(query));

  if (!project) {
    ctx.print(`no project matching '${query}'`, "error");
    ctx.printHTML(
      `<span class="muted">run</span> <span class="accent">projects</span> <span class="muted">to list them all</span>`,
    );
    return;
  }

  ctx.print(project.title, "accent");
  ctx.print();
  ctx.print(`  ${project.description}`);
  ctx.print();
  if (project.details) {
    for (const detail of project.details) ctx.print(`  · ${detail}`);
    ctx.print();
  }
  if (project.tech.length > 0) {
    ctx.print(`  tech:  ${project.tech.join(", ")}`, "muted");
  }
  if (project.repo) ctx.printHTML(`  repo:  ${link(project.repo)}`);
  if (project.live) ctx.printHTML(`  live:  ${link(project.live)}`);
}
