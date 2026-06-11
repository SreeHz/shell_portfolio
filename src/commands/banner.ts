import type { Command } from "../types";
import { profile } from "../content";

// figlet "Standard" font
const ART = [
  "                                    _   _     ",
  "  _ __ __ _ _____      ____ _ _ __ | |_| |__  ",
  " | '__/ _` / __\\ \\ /\\ / / _` | '_ \\| __| '_ \\ ",
  " | | | (_| \\__ \\\\ V  V / (_| | | | | |_| | | |",
  " |_|  \\__,_|___/ \\_/\\_/ \\__,_|_| |_|\\__|_| |_|",
];

export const banner: Command = {
  name: "banner",
  description: "show the welcome banner",
  run(_args, ctx) {
    for (const line of ART) ctx.print(line, "banner accent");
    ctx.print();
    ctx.print(`${profile.role} · ${profile.location}`, "muted");
    ctx.print();
    ctx.printHTML(
      `Type <span class="accent">help</span> to see what you can do here.`,
    );
    ctx.print();
  },
};
