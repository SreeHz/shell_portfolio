import type { Command } from "../types";

export const socials: Command = {
  name: "socials",
  description: "alias for contact",
  run(args, ctx) {
    ctx.commands.get("contact")?.run(args, ctx);
  },
};
