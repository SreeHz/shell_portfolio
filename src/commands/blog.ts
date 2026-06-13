import type { Command } from "../types";

const BLOG_URL = "https://blog.raswanth.workers.dev/";

export const blog: Command = {
  name: "blog",
  description: "open my blog",
  run(_args, ctx) {
    ctx.print("opening blog …");
    window.open(BLOG_URL, "_blank", "noopener");
  },
};
