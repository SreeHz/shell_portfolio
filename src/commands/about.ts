import type { Command } from "../types";
import { profile } from "../content";

export const about: Command = {
  name: "about",
  description: "who I am",
  run(_args, ctx) {
    ctx.print();
    for (const line of profile.about) ctx.print(line);
    ctx.print();
  },
};
