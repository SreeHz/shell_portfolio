import type { Command } from "../types";

const AUTHOR_CMDS = ["about", "projects", "skills", "experience", "education", "awards", "contact", "resume", "blog"];
const SYSTEM_CMDS = ["help", "clear", "theme", "banner", "neofetch", "whoami", "pwd", "uname", "date", "uptime", "echo", "ls", "sudo", "apt", "rm", "reboot"];

export const help: Command = {
  name: "help",
  description: "list available commands",
  run(_args, ctx) {
    const row = (name: string) => {
      const cmd = ctx.commands.get(name);
      if (!cmd) return "";
      return `<div class="help-row"><span class="help-cmd">${cmd.name}</span><span class="help-desc">${cmd.description}</span></div>`;
    };

    ctx.print();
    ctx.printHTML(`<div class="help-grid">
  <div class="help-col">
    <div class="help-col-hd">&#x1F464; Wanna know about the author?</div>
    ${AUTHOR_CMDS.map(row).join("")}
  </div>
  <div class="help-col-sep"></div>
  <div class="help-col">
    <div class="help-col-hd">&#x2699;&#xFE0F; System Commands</div>
    ${SYSTEM_CMDS.map(row).join("")}
  </div>
</div>`);
    ctx.print();
    ctx.print("  ↑/↓ history  ·  Tab autocomplete  ·  Ctrl+L clear  ·  Ctrl+C cancel", "muted");
    ctx.print();
  },
};
