import "./styles/main.css";
import { Terminal } from "./terminal";
import { commands } from "./commands";
import { restoreTheme } from "./commands/theme";

restoreTheme();

// ── Elements ──────────────────────────────────────────────────────────────────
const desktop     = document.getElementById("desktop")!;
const tbCenter    = document.getElementById("tb-center")!;
const termIcon    = document.getElementById("terminal-icon")!;
const snapPreview = document.getElementById("snap-preview")!;

const TASKBAR_H      = 38;
const MIN_W          = 380;
const MIN_H          = 260;
const SNAP_THRESHOLD = 8;

// ── Window registry ───────────────────────────────────────────────────────────
interface WinInstance {
  el: HTMLElement;
  term: Terminal;
  isMinimized: boolean;
  chaosActive: boolean;
  snapped: boolean;
  savedStyle: { left: string; top: string; width: string; height: string };
  open(): void;
  close(): void;
  minimize(): void;
  doMaximize(): void;
  doRestore(): void;
  toggleMaximize(): void;
  snapHalf(side: "left" | "right"): void;
  unsnap(): void;
  centerWindow(offset: number): void;
}

let wins: WinInstance[] = [];
let zTop = 200;

function bringToFront(w: WinInstance) {
  w.el.style.zIndex = String(++zTop);
}

// ── Taskbar ───────────────────────────────────────────────────────────────────
const TERM_ICON_SVG = `<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="1" width="14" height="11" rx="1.5"/><polyline points="3 5 5.5 7 3 9"/><line x1="7" y1="9" x2="13" y2="9"/></svg>`;

function rebuildTaskbar() {
  tbCenter.innerHTML = "";
  wins.forEach((w, i) => {
    const label = wins.length > 1 ? `Terminal ${i + 1}` : "Terminal";
    const btn = document.createElement("button");
    btn.className = `tb-win-btn${!w.isMinimized ? " active" : ""}`;
    btn.innerHTML = `${TERM_ICON_SVG} ${label}`;
    btn.addEventListener("click", () => {
      if (w.isMinimized) {
        w.isMinimized = false;
        w.el.classList.add("open");
        bringToFront(w);
        rebuildTaskbar();
      } else {
        w.minimize();
      }
    });
    tbCenter.append(btn);
  });
}

// ── Window factory ────────────────────────────────────────────────────────────
let winSeq = 0;

function spawnWindow(): WinInstance {
  winSeq++;
  const termElId = `terminal-body-${winSeq}`;

  const el = document.createElement("div");
  el.className = "win";
  el.innerHTML = `
    <div class="rh rh-n"></div><div class="rh rh-ne"></div>
    <div class="rh rh-e"></div><div class="rh rh-se"></div>
    <div class="rh rh-s"></div><div class="rh rh-sw"></div>
    <div class="rh rh-w"></div><div class="rh rh-nw"></div>
    <div class="titlebar">
      <div class="traffic-lights">
        <button class="tl tl-close"    title="Close"    aria-label="Close">&#x2715;</button>
        <button class="tl tl-minimize" title="Minimize" aria-label="Minimize">&#x2212;</button>
        <button class="tl tl-maximize" title="Maximize" aria-label="Maximize">&#x2b;</button>
      </div>
      <span class="titlebar-title">raswanth@portfolio: ~</span>
      <div class="titlebar-spacer"></div>
    </div>
    <main id="${termElId}" class="terminal-body"></main>
  `;

  desktop.insertBefore(el, document.getElementById("taskbar"));

  const term = new Terminal(el.querySelector<HTMLElement>(`#${termElId}`)!);

  const w: WinInstance = {
    el, term,
    isMinimized: false,
    chaosActive: false,
    snapped: false,
    savedStyle: { left: "", top: "", width: "", height: "" },

    centerWindow(offset: number) {
      const vw = window.innerWidth;
      const vh = window.innerHeight - TASKBAR_H;
      const ww = Math.min(880, vw - 40);
      const wh = Math.min(580, vh - 40);
      el.style.width  = `${ww}px`;
      el.style.height = `${wh}px`;
      el.style.left   = `${(vw - ww) / 2 + offset}px`;
      el.style.top    = `${(vh - wh) / 2 + offset}px`;
    },

    open() {
      el.classList.add("open");
      el.classList.remove("closing");
      this.isMinimized = false;
      bringToFront(this);
      rebuildTaskbar();
      setTimeout(() => el.querySelector<HTMLInputElement>("input")?.focus(), 60);
    },

    close() {
      if (this.chaosActive) return;
      el.classList.add("closing");
      setTimeout(() => {
        el.remove();
        wins = wins.filter((x) => x !== w);
        rebuildTaskbar();
      }, 220);
    },

    minimize() {
      if (this.chaosActive) return;
      el.classList.remove("open");
      this.isMinimized = true;
      rebuildTaskbar();
    },

    doMaximize() {
      if (el.classList.contains("maximized")) return;
      this.savedStyle = { left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height };
      el.style.left   = "0";
      el.style.top    = "0";
      el.style.width  = "100%";
      el.style.height = `calc(100% - ${TASKBAR_H}px)`;
      el.classList.add("maximized");
      el.classList.remove("snapped");
      this.snapped = false;
    },

    doRestore() {
      if (!el.classList.contains("maximized")) return;
      Object.assign(el.style, this.savedStyle);
      el.classList.remove("maximized");
    },

    toggleMaximize() {
      if (this.chaosActive) return;
      if (el.classList.contains("maximized")) this.doRestore();
      else this.doMaximize();
    },

    snapHalf(side) {
      this.savedStyle = { left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height };
      el.style.top    = "0";
      el.style.width  = "50%";
      el.style.height = `calc(100% - ${TASKBAR_H}px)`;
      el.style.left   = side === "left" ? "0" : "50%";
      el.classList.add("snapped");
      el.classList.remove("maximized");
      this.snapped = true;
    },

    unsnap() {
      Object.assign(el.style, this.savedStyle);
      el.classList.remove("snapped");
      this.snapped = false;
    },
  };

  // Chaos mode
  term.onChaosMode = () => {
    w.chaosActive = true;
    document.body.classList.add("chaos-mode");
    tbCenter.innerHTML = "";
  };

  // Bring to front on any mousedown
  el.addEventListener("mousedown", () => bringToFront(w), true);

  // Traffic lights
  el.querySelector(".tl-close")   ?.addEventListener("click", () => w.close());
  el.querySelector(".tl-minimize")?.addEventListener("click", () => w.minimize());
  el.querySelector(".tl-maximize")?.addEventListener("click", () => w.toggleMaximize());

  // Titlebar drag
  el.querySelector<HTMLElement>(".titlebar")!.addEventListener("mousedown", (e) => {
    if ((e.target as Element).closest(".traffic-lights")) return;
    if (w.chaosActive) return;
    e.preventDefault();

    if (el.classList.contains("maximized")) {
      const ratio = e.clientX / el.offsetWidth;
      w.doRestore();
      el.style.left = `${Math.max(0, e.clientX - el.offsetWidth * ratio)}px`;
      el.style.top  = `${Math.max(0, e.clientY - 19)}px`;
    } else if (w.snapped) {
      w.unsnap();
      el.style.left = `${Math.max(0, e.clientX - el.offsetWidth / 2)}px`;
      el.style.top  = `${Math.max(0, e.clientY - 19)}px`;
    }

    dragging = true;
    dragWin  = w;
    dragOX   = e.clientX - el.offsetLeft;
    dragOY   = e.clientY - el.offsetTop;
    document.body.style.cursor = "grabbing";
  });

  // Resize handles
  el.querySelectorAll<HTMLElement>(".rh").forEach((handle) => {
    handle.addEventListener("mousedown", (e) => {
      if (el.classList.contains("maximized") || w.chaosActive) return;
      const dir = [...handle.classList].find((c) => c.startsWith("rh-"))?.slice(3) ?? "";
      Object.assign(rsState, {
        active: true, dir, win: w,
        startX: e.clientX, startY: e.clientY,
        startW: el.offsetWidth, startH: el.offsetHeight,
        startL: el.offsetLeft,  startT: el.offsetTop,
      });
      e.preventDefault();
      e.stopPropagation();
    });
  });

  const offset = wins.length * 28;
  w.centerWindow(offset);
  wins.push(w);
  return w;
}

// ── Global drag state ─────────────────────────────────────────────────────────
let dragging = false, dragOX = 0, dragOY = 0;
let dragWin: WinInstance | null = null;
let snapEdge: "" | "top" | "left" | "right" = "";

const rsState = {
  active: false, dir: "", win: null as WinInstance | null,
  startX: 0, startY: 0, startW: 0, startH: 0, startL: 0, startT: 0,
};

window.addEventListener("mousemove", (e) => {
  if (dragging && dragWin) {
    const nearTop   = e.clientY < SNAP_THRESHOLD;
    const nearLeft  = e.clientX < SNAP_THRESHOLD;
    const nearRight = e.clientX > window.innerWidth - SNAP_THRESHOLD;

    snapEdge = nearTop ? "top" : nearLeft ? "left" : nearRight ? "right" : "";
    snapPreview.className = snapEdge ? `visible snap-${snapEdge}` : "";
    if (snapEdge) return;

    const el  = dragWin.el;
    const maxX = window.innerWidth  - el.offsetWidth  + 60;
    const maxY = window.innerHeight - TASKBAR_H - 30;
    el.style.left = `${Math.max(-el.offsetWidth + 80, Math.min(maxX, e.clientX - dragOX))}px`;
    el.style.top  = `${Math.max(0, Math.min(maxY, e.clientY - dragOY))}px`;
    return;
  }

  if (rsState.active && rsState.win) {
    const { dir, startX, startY, startW, startH, startL, startT } = rsState;
    const el = rsState.win.el;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    let nw = startW, nh = startH, nl = startL, nt = startT;

    if (dir.includes("e")) nw = Math.max(MIN_W, startW + dx);
    if (dir.includes("s")) nh = Math.max(MIN_H, startH + dy);
    if (dir.includes("w")) { nw = Math.max(MIN_W, startW - dx); nl = startL + (startW - nw); }
    if (dir.includes("n")) { nh = Math.max(MIN_H, startH - dy); nt = startT + (startH - nh); }

    nt = Math.max(0, Math.min(nt, window.innerHeight - TASKBAR_H - MIN_H));
    nl = Math.max(-nw + 80, nl);

    el.style.width  = `${nw}px`;
    el.style.height = `${nh}px`;
    el.style.left   = `${nl}px`;
    el.style.top    = `${nt}px`;
  }
});

window.addEventListener("mouseup", () => {
  if (dragging && dragWin) {
    dragging = false;
    document.body.style.cursor = "";
    snapPreview.className = "";
    const edge = snapEdge;
    snapEdge = "";
    if (edge === "top")   dragWin.doMaximize();
    else if (edge === "left")  dragWin.snapHalf("left");
    else if (edge === "right") dragWin.snapHalf("right");
    dragWin = null;
  }
  rsState.active = false;
  rsState.win    = null;
});

// ── Sarcasm notification stack ────────────────────────────────────────────────
const SARCASM = [
  "Two terminals is already a personality disorder. Slow down.",
  "Still trying? Two is the limit. This is a portfolio, not a server farm.",
  "Three terminals? Who do you think you are — Linus Torvalds?",
  "I admire the persistence. The answer is still no.",
  "Error 429: Too Many Terminals. Seriously though, why.",
  "You've unlocked: Terminal Hoarder. The prize is exactly nothing.",
  "At this point I'm just impressed by the commitment to chaos.",
  "No. Nope. Nein. Nyet. The language changes, the limit doesn't.",
  "rm -rf your expectations. Two terminals. Final answer.",
  "Have you tried closing one first? Revolutionary concept, I know.",
];
let sarcasmIdx = 0;

const notifContainer = document.getElementById("notif-container")!;

function pushNotif() {
  const msg = SARCASM[sarcasmIdx++ % SARCASM.length];

  const item = document.createElement("div");
  item.className = "notif-item";
  item.innerHTML = `
    <div class="notif-hd">
      <span class="notif-title">&#x26A0; Terminal Limit</span>
      <div class="notif-bar"><div class="notif-bar-fill"></div></div>
    </div>
    <div class="notif-msg">${msg}</div>`;
  notifContainer.append(item);

  // Slide in on next frame
  requestAnimationFrame(() => item.classList.add("show"));

  // Start dismiss after 5s
  setTimeout(() => dismissNotif(item), 5000);
}

function dismissNotif(item: HTMLElement) {
  // Phase 1: slide out to the right (280ms)
  item.classList.remove("show");
  item.classList.add("hiding");

  // Phase 2: collapse height so items above close the gap (220ms)
  setTimeout(() => {
    item.classList.add("collapsing");
    setTimeout(() => item.remove(), 230);
  }, 290);
}

// ── Desktop icon ──────────────────────────────────────────────────────────────
termIcon.addEventListener("click", () => termIcon.classList.add("active"));
document.addEventListener("click", (e) => {
  if (!(e.target as Element).closest("#terminal-icon")) termIcon.classList.remove("active");
});

function openOrSpawn() {
  // Hard cap: only 2 windows (open or minimized) at a time
  if (wins.length >= 2) {
    pushNotif();
    return;
  }
  // If any window is already visible, spawn a second one
  const visible = wins.filter((w) => !w.isMinimized);
  if (visible.length > 0) {
    const nw = spawnWindow();
    nw.open();
    void commands.get("banner")!.run([], nw.term.ctx);
    return;
  }
  // Restore a minimized window (same session, no banner)
  const minimized = wins.find((w) => w.isMinimized);
  if (minimized) {
    minimized.isMinimized = false;
    minimized.el.classList.add("open");
    bringToFront(minimized);
    rebuildTaskbar();
    return;
  }
  // First open ever
  const nw = spawnWindow();
  nw.open();
  void commands.get("banner")!.run([], nw.term.ctx);
}

termIcon.addEventListener("dblclick", openOrSpawn);

// touch double-tap
let tapCount = 0, tapTimer = 0;
termIcon.addEventListener("touchend", (e) => {
  e.preventDefault();
  tapCount++;
  clearTimeout(tapTimer);
  if (tapCount >= 2) { tapCount = 0; openOrSpawn(); }
  else tapTimer = window.setTimeout(() => { tapCount = 0; }, 350);
});

termIcon.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openOrSpawn(); }
});

// ── Taskbar: Battery ─────────────────────────────────────────────────────────
const batFill  = document.getElementById("bat-fill")! as unknown as SVGRectElement;
const batPctEl = document.getElementById("tb-bat-pct")!;
const MAX_FILL = 14;

function setBattery(level: number, charging: boolean) {
  const pct = Math.round(level * 100);
  batPctEl.textContent = (charging ? "⚡ " : "") + pct + "%";
  batFill.setAttribute("width", String(Math.round(pct * MAX_FILL / 100)));
  const colour = pct <= 15 ? "#ff5f57" : pct <= 40 ? "#febc2e" : "#39d353";
  batFill.style.color = colour;
}

if ("getBattery" in navigator) {
  (navigator as any).getBattery().then((b: any) => {
    setBattery(b.level, b.charging);
    b.addEventListener("levelchange",    () => setBattery(b.level, b.charging));
    b.addEventListener("chargingchange", () => setBattery(b.level, b.charging));
  }).catch(() => { batPctEl.textContent = "??%"; });
} else {
  batPctEl.textContent = "??%";
}

// ── Taskbar: Clock ────────────────────────────────────────────────────────────
const timeEl     = document.getElementById("tb-time")!;
const dateEl     = document.getElementById("tb-date")!;
const ttDay      = document.getElementById("tt-day")!;
const ttFulldate = document.getElementById("tt-fulldate")!;
const ttFulltime = document.getElementById("tt-fulltime")!;

function tickClock() {
  const n = new Date();
  timeEl.textContent     = n.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  dateEl.textContent     = n.toLocaleDateString([], { month: "short", day: "numeric" });
  ttDay.textContent      = n.toLocaleDateString([], { weekday: "long" });
  ttFulldate.textContent = n.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
  ttFulltime.textContent = n.toLocaleTimeString();
}
tickClock();
setInterval(tickClock, 1000);
