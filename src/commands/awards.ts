import type { Command } from "../types";
import { profile } from "../content";

export const awards: Command = {
  name: "awards",
  description: "awards & certifications",
  run(_args, ctx) {
    ctx.print();
    for (const award of profile.awards) ctx.print(`  · ${award}`);
    ctx.print();
  },
};
