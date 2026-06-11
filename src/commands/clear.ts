import type { Command } from "../types";

export const clear: Command = {
  name: "clear",
  description: "clear the terminal screen",
  run(_args, ctx) {
    ctx.clear();
  },
};
