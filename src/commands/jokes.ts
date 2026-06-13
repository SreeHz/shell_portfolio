import type { Command } from "../types";
import { escapeHtml } from "../utils";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Chaos mode responses (exported — used by terminal.ts) ─────────────────────
export const CHAOS_RESPONSES: Array<(cmd: string) => string> = [
  (cmd) => `error: file '${cmd}' not found. (Also your filesystem isn't here anymore.)`,
  (_cmd) => `I WARNED YOU. I literally said not to. What is wrong with you?`,
  (cmd) => `Unknown command '${cmd}'. It sounds like Klingon. Qapla'!!`,
  (_cmd) => `error: no such device. error: no such partition. error: no such hope.`,
  (cmd) => `'${cmd}'? You deleted everything and NOW you want to run commands? Brave.`,
  (_cmd) => `I don't know what you expect me to do. You burned it all down.`,
  (cmd) => `${cmd}: command not found. Nothing is found. You burned it all down.`,
  (cmd) => `I don't know what '${cmd}' means and at this point I don't care.`,
  (_cmd) => `You are the reason sysadmins drink.`,
  (cmd) => `error: unknown filesystem. error: unknown command '${cmd}'. error: unknown why you did this.`,
  (_cmd) => `help is not available. You deleted help along with everything else.`,
  (cmd) => `'${cmd}': No such file or directory. BECAUSE THERE IS NO DIRECTORY ANYMORE.`,
  (_cmd) => `This is entirely your fault. I want that on the record.`,
  (cmd) => `Attempting '${cmd}'... lol. No.`,
  (_cmd) => `I am a grub rescue terminal. I have one job: survive your stupidity. It's hard.`,
  (cmd) => `'${cmd}' — was that Klingon? Ancient Sumerian? I genuinely cannot tell.`,
  (_cmd) => `Oh you're still trying things. Adorable. Nothing will work.`,
  (cmd) => `${cmd}: not found. Shockingly, deleting everything makes commands stop working.`,
  (_cmd) => `You know what would fix this? Typing 'reboot'. Just saying.`,
  (cmd) => `I'd help you run '${cmd}', but you deleted the thing that runs things.`,
];

// ── sudo messages ─────────────────────────────────────────────────────────────
const SUDO_MSGS = [
  "sudo: raswanth is not in the sudoers file. This incident will be reported. (To nobody.)",
  "Oh? You thought root access on a portfolio would just... work? Cute.",
  "Permission denied. Your confidence is impressive and completely misplaced.",
  "sudo: command not found in your list of good ideas.",
  "You want root access? On MY portfolio? That is adorable.",
  "Sorry, you need a tty to run sudo. Or a different career path.",
  "sudo: 3 incorrect password attempts. (You didn't even get one attempt, relax.)",
  "This is a portfolio. Not a server. Not a VM. A portfolio.",
];

// ── apt messages ──────────────────────────────────────────────────────────────
const APT_UPDATE_MSGS = [
  `Hit:1 https://portfolio.dev stable InRelease
Get:2 https://portfolio.dev stable/main amd64 Packages [404 Not Found]
Err:1 https://portfolio.dev stable/main
  404 Not Found
Fetched 0 B in 0s (0 B/s)
E: Failed to fetch. Just like your plan.`,

  `Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
All packages are up to date.
(This portfolio ships perfectly fine without your help, thanks.)`,

  `E: Could not open lock file /var/lib/apt/lists/lock - open (13: Permission denied)
E: Unable to lock directory /var/lib/apt/lists/
E: Also this is not Ubuntu. Or Debian. It's a portfolio.`,

  `Fetching package index...
...
...
404. Oops. Almost like this was never a real apt environment.`,
];

const APT_UPGRADE_MSGS = [
  `Reading package lists... Done
Building dependency tree... Done
Calculating upgrade... Done
0 upgraded, 0 newly installed, 0 to remove, 0 not upgraded.
Translation: absolutely nothing happened. As expected.`,

  `The following packages will be upgraded:
  your-expectations (1.0 → 0.0)
Do you want to continue? [Y/n] ... it doesn't matter. Nothing will change.`,

  `E: dpkg was interrupted. You must manually run 'dpkg --configure -a'.
Just kidding. There's no dpkg. There's no apt. There's just vibes.`,

  `WARNING: apt does not have a stable CLI interface. Use with caution in scripts.
Also: this is not apt. Caution may be too late.`,
];

// ── rm -rf boot sequence ──────────────────────────────────────────────────────
const BOOT_LINES = [
  { text: "[sudo] password for raswanth: ••••••••••••", delay: 800 },
  { text: "", delay: 200 },
  { text: "rm: it seems you are trying to remove '/'. Are you sure? [y/N] y", delay: 600 },
  { text: "", delay: 200 },
  { text: "removing /bin...", delay: 100 },
  { text: "removing /boot...", delay: 90 },
  { text: "removing /dev...", delay: 80 },
  { text: "removing /etc...", delay: 90 },
  { text: "removing /home/raswanth... goodbye forever 👋", delay: 300 },
  { text: "removing /lib...", delay: 80 },
  { text: "removing /lib64...", delay: 80 },
  { text: "removing /opt...", delay: 70 },
  { text: "removing /proc...", delay: 80 },
  { text: "removing /root...", delay: 80 },
  { text: "removing /sbin...", delay: 70 },
  { text: "removing /sys...", delay: 70 },
  { text: "removing /tmp...", delay: 70 },
  { text: "removing /usr...", delay: 90 },
  { text: "removing /var...", delay: 80 },
  { text: "", delay: 400 },
  { text: "[    0.000000] Kernel panic - not syncing: VFS: Unable to mount root fs on unknown-block(0,0)", delay: 80 },
  { text: "[    0.000000] CPU: 0 PID: 1 Comm: swapper/0 Not tainted 5.15.0-portfolio #1", delay: 60 },
  { text: "[    0.000000] Hardware name: Portfolio/Browser Board, BIOS v2025.06", delay: 60 },
  { text: "[    0.000000] Call Trace:", delay: 60 },
  { text: "[    0.000000]  <TASK>", delay: 50 },
  { text: "[    0.000000]  panic+0x166/0x32c", delay: 50 },
  { text: "[    0.000000]  mount_block_root+0x1b3/0x1c0", delay: 50 },
  { text: "[    0.000000]  prepare_namespace+0x14c/0x180", delay: 50 },
  { text: "[    0.000000]  kernel_init_freeable+0x2e8/0x300", delay: 50 },
  { text: "[    0.000000] ---[ end Kernel panic - not syncing: VFS unable to mount root ]---", delay: 300 },
  { text: "", delay: 500 },
  { text: "", delay: 300 },
  { text: "GRUB loading.", delay: 400 },
  { text: "", delay: 300 },
  { text: "error: no such partition.", delay: 300 },
  { text: "Entering rescue mode...", delay: 500 },
  { text: "grub rescue> _", delay: 0 },
];

type Ctx = Parameters<Command["run"]>[1];

function isRmRfRoot(args: string[]): boolean {
  const joined = args.join(" ").trim().replace(/\s+/g, " ");
  return (
    joined === "rm -rf /" ||
    joined === "rm -rf /*" ||
    joined === "rm -rf / --no-preserve-root" ||
    joined === "rm --no-preserve-root -rf /" ||
    joined === "-rf /" ||
    joined === "-rf /*"
  );
}

async function runRmRfSequence(ctx: Ctx): Promise<void> {
  ctx.print();
  for (const { text, delay } of BOOT_LINES) {
    ctx.print(text);
    if (delay > 0) await new Promise((r) => setTimeout(r, delay));
  }
  await new Promise((r) => setTimeout(r, 300));
  ctx.activateChaosMode();
}

// ── Exported commands ─────────────────────────────────────────────────────────

export const sudoCommand: Command = {
  name: "sudo",
  description: "superuser do — go on, try it",
  async run(args, ctx) {
    const joined = args.join(" ").trim().replace(/\s+/g, " ");

    // sudo rm -rf / (catch all common variations)
    if (
      /^rm(\s+--no-preserve-root)?\s+-rf\s+[/*]/.test(joined) ||
      /^rm\s+-rf(\s+--no-preserve-root)?\s+[/*]/.test(joined)
    ) {
      await runRmRfSequence(ctx);
      return;
    }

    if (joined === "apt update" || joined === "apt-get update") {
      ctx.print();
      ctx.print(pick(APT_UPDATE_MSGS));
      ctx.print();
      return;
    }

    if (
      joined === "apt upgrade" ||
      joined === "apt-get upgrade" ||
      joined === "apt full-upgrade" ||
      joined === "apt-get dist-upgrade"
    ) {
      ctx.print();
      ctx.print(pick(APT_UPGRADE_MSGS));
      ctx.print();
      return;
    }

    ctx.print();
    ctx.print(pick(SUDO_MSGS), "muted");
    ctx.print();
  },
};

export const aptCommand: Command = {
  name: "apt",
  description: "package manager (this isn't Ubuntu)",
  run(args, ctx) {
    const sub = args[0]?.toLowerCase();
    ctx.print();
    if (sub === "update") {
      ctx.print(pick(APT_UPDATE_MSGS));
    } else if (sub === "upgrade" || sub === "full-upgrade" || sub === "dist-upgrade") {
      ctx.print(pick(APT_UPGRADE_MSGS));
    } else if (sub === "install") {
      const pkg = args[1] ?? "something";
      ctx.printHTML(
        `E: Unable to locate package <span class="accent">${escapeHtml(pkg)}</span><br>` +
        `<span class="muted">Also: this is not a package manager. It's a portfolio.</span>`,
      );
    } else {
      ctx.print("apt: this is not a real package manager. type help instead.", "muted");
    }
    ctx.print();
  },
};

export const rmCommand: Command = {
  name: "rm",
  description: "remove files — carefully",
  async run(args, ctx) {
    if (isRmRfRoot(args)) {
      await runRmRfSequence(ctx);
      return;
    }
    ctx.print();
    ctx.print(`rm: cannot remove: Permission denied. (Good.)`, "muted");
    ctx.print(`rm: this is a read-only portfolio. Nothing to delete here.`, "muted");
    ctx.print();
  },
};

export const rebootCommand: Command = {
  name: "reboot",
  description: "reboot the system (or escape grub rescue)",
  async run(_args, ctx) {
    ctx.print();
    ctx.print("Rebooting...", "muted");
    await new Promise((r) => setTimeout(r, 800));
    ctx.print("Are you sure you want to reboot? [y/N]", "muted");
    await new Promise((r) => setTimeout(r, 1200));
    ctx.print("y", "accent");
    await new Promise((r) => setTimeout(r, 600));
    location.reload();
  },
};
