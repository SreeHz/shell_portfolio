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
const startMenu   = document.getElementById("start-menu")!;
const launcher    = document.querySelector<HTMLElement>(".tb-launcher")!;

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

// ── Start Menu (Application Launcher) ────────────────────────────────────────
interface AppEntry {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  icon: string;
  favorite?: boolean;
}

const SM_ICONS = {
  folder:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>`,
  doc:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
  terminal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="15" rx="2"/><polyline points="6 9 10 12 6 15"/><line x1="13" y1="15" x2="18" y2="15"/></svg>`,
  calc:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="13" x2="8" y2="13" stroke-width="3"/><line x1="12" y1="13" x2="12" y2="13" stroke-width="3"/><line x1="16" y1="13" x2="16" y2="13" stroke-width="3"/><line x1="8" y1="17" x2="8" y2="17" stroke-width="3"/><line x1="12" y1="17" x2="12" y2="17" stroke-width="3"/><line x1="16" y1="17" x2="16" y2="17" stroke-width="3"/></svg>`,
  archive:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
  globe:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>`,
  mail:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>`,
  sheet:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`,
  display:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  image:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  pencil:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
  play:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  music:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  gear:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
  activity: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  search:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  moon:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`,
  refresh:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>`,
  power:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 11-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>`,
  logout:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
};

const APPS: AppEntry[] = [
  { id: "dolphin",     name: "Dolphin",             subtitle: "File Manager",         category: "Utilities",  icon: SM_ICONS.folder,   favorite: true },
  { id: "kate",        name: "Kate",                subtitle: "Advanced Text Editor", category: "Utilities",  icon: SM_ICONS.doc,      favorite: true },
  { id: "konsole",     name: "Konsole",             subtitle: "Terminal Emulator",    category: "Utilities",  icon: SM_ICONS.terminal, favorite: true },
  { id: "calculator",  name: "Calculator",          subtitle: "Calculator",           category: "Utilities",  icon: SM_ICONS.calc },
  { id: "ark",         name: "Ark",                 subtitle: "Archiving Tool",       category: "Utilities",  icon: SM_ICONS.archive },
  { id: "firefox",     name: "Firefox",             subtitle: "Web Browser",          category: "Internet",   icon: SM_ICONS.globe,    favorite: true },
  { id: "thunderbird", name: "Thunderbird",         subtitle: "Email Client",         category: "Internet",   icon: SM_ICONS.mail },
  { id: "lo-writer",   name: "LibreOffice Writer",  subtitle: "Word Processor",       category: "Office",     icon: SM_ICONS.doc },
  { id: "lo-calc",     name: "LibreOffice Calc",    subtitle: "Spreadsheet",          category: "Office",     icon: SM_ICONS.sheet },
  { id: "lo-impress",  name: "LibreOffice Impress", subtitle: "Presentation",         category: "Office",     icon: SM_ICONS.display },
  { id: "gwenview",    name: "Gwenview",            subtitle: "Image Viewer",         category: "Graphics",   icon: SM_ICONS.image },
  { id: "gimp",        name: "GIMP",                subtitle: "Image Editor",         category: "Graphics",   icon: SM_ICONS.pencil },
  { id: "vlc",         name: "VLC",                 subtitle: "Media Player",         category: "Multimedia", icon: SM_ICONS.play },
  { id: "elisa",       name: "Elisa",               subtitle: "Music Player",         category: "Multimedia", icon: SM_ICONS.music },
  { id: "settings",    name: "System Settings",     subtitle: "Configure KDE",        category: "System",     icon: SM_ICONS.gear,     favorite: true },
  { id: "sysmonitor",  name: "System Monitor",      subtitle: "Task Manager",         category: "System",     icon: SM_ICONS.activity },
  { id: "discover",    name: "Discover",            subtitle: "Software Center",      category: "System",     icon: SM_ICONS.search },
];

const SM_POWER = [
  { title: "Hibernate", icon: SM_ICONS.moon    },
  { title: "Restart",   icon: SM_ICONS.refresh },
  { title: "Shut Down", icon: SM_ICONS.power   },
  { title: "Log Out",   icon: SM_ICONS.logout  },
];

const APP_ACTIONS: Record<string, () => void> = {};

let smUserTab: "favorites" | "apps" = "favorites";

function smMakeItem(app: AppEntry): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.className = "sm-item";
  btn.dataset.name = app.name.toLowerCase();
  btn.innerHTML = `
    <span class="sm-item-icon">${app.icon}</span>
    <span class="sm-item-info">
      <span class="sm-item-name">${app.name}</span>
      <span class="sm-item-sub">${app.subtitle}</span>
    </span>`;
  btn.addEventListener("click", () => { APP_ACTIONS[app.id]?.(); });
  return btn;
}

function buildStartMenu() {
  const searchWrap = document.createElement("div");
  searchWrap.className = "sm-search";
  searchWrap.innerHTML = `
    <span class="sm-search-icon">${SM_ICONS.search}</span>
    <input class="sm-search-input" type="search" placeholder="Search applications…"
           autocomplete="off" spellcheck="false" />`;

  const tabs = document.createElement("div");
  tabs.className = "sm-tabs";
  tabs.innerHTML = `
    <button class="sm-tab active" data-tab="favorites">Favorites</button>
    <button class="sm-tab" data-tab="apps">Applications</button>`;

  const favList = document.createElement("div");
  favList.className = "sm-app-list";
  favList.id = "sm-list-favorites";
  APPS.filter(a => a.favorite).forEach(a => favList.append(smMakeItem(a)));

  const appsList = document.createElement("div");
  appsList.className = "sm-app-list sm-hidden";
  appsList.id = "sm-list-apps";
  const cats = [...new Set(APPS.map(a => a.category))];
  cats.forEach(cat => {
    const lbl = document.createElement("div");
    lbl.className = "sm-category-label";
    lbl.textContent = cat;
    appsList.append(lbl);
    APPS.filter(a => a.category === cat).forEach(a => appsList.append(smMakeItem(a)));
  });

  const body = document.createElement("div");
  body.className = "sm-body";
  body.append(favList, appsList);

  const footer = document.createElement("div");
  footer.className = "sm-footer";
  const spacer = document.createElement("span");
  spacer.className = "sm-footer-spacer";
  footer.append(spacer);
  SM_POWER.forEach(({ title, icon }) => {
    const btn = document.createElement("button");
    btn.className = "sm-power-btn";
    btn.title = title;
    btn.setAttribute("aria-label", title);
    btn.innerHTML = icon;
    footer.append(btn);
  });

  startMenu.append(searchWrap, tabs, body, footer);

  // Tab switching
  tabs.querySelectorAll<HTMLButtonElement>(".sm-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const t = tab.dataset.tab as "favorites" | "apps";
      smUserTab = t;
      tabs.querySelectorAll(".sm-tab").forEach(b => b.classList.remove("active"));
      tab.classList.add("active");
      favList.classList.toggle("sm-hidden", t !== "favorites");
      appsList.classList.toggle("sm-hidden", t !== "apps");
    });
  });

  // Search
  const searchInput = searchWrap.querySelector<HTMLInputElement>(".sm-search-input")!;
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase().trim();
    if (q) {
      tabs.querySelectorAll(".sm-tab").forEach(b => b.classList.remove("active"));
      tabs.querySelector<HTMLButtonElement>("[data-tab='apps']")!.classList.add("active");
      favList.classList.add("sm-hidden");
      appsList.classList.remove("sm-hidden");
      appsList.querySelectorAll<HTMLElement>(".sm-item").forEach(item => {
        item.style.display = (item.dataset.name ?? "").includes(q) ? "" : "none";
      });
      appsList.querySelectorAll<HTMLElement>(".sm-category-label").forEach(lbl => {
        let sib = lbl.nextElementSibling;
        let any = false;
        while (sib && !sib.classList.contains("sm-category-label")) {
          if ((sib as HTMLElement).style.display !== "none") any = true;
          sib = sib.nextElementSibling;
        }
        lbl.style.display = any ? "" : "none";
      });
    } else {
      tabs.querySelectorAll(".sm-tab").forEach(b => b.classList.remove("active"));
      tabs.querySelector<HTMLButtonElement>(`[data-tab='${smUserTab}']`)!.classList.add("active");
      favList.classList.toggle("sm-hidden", smUserTab !== "favorites");
      appsList.classList.toggle("sm-hidden", smUserTab !== "apps");
      appsList.querySelectorAll<HTMLElement>(".sm-item, .sm-category-label").forEach(el => {
        el.style.display = "";
      });
    }
  });
}

function openStartMenu() {
  startMenu.classList.add("sm-open");
  launcher.classList.add("sm-launcher-active");
  startMenu.removeAttribute("aria-hidden");
  startMenu.querySelector<HTMLInputElement>(".sm-search-input")?.focus();
}

function closeStartMenu() {
  startMenu.classList.remove("sm-open");
  launcher.classList.remove("sm-launcher-active");
  startMenu.setAttribute("aria-hidden", "true");
}

launcher.addEventListener("click", (e) => {
  e.stopPropagation();
  if (startMenu.classList.contains("sm-open")) closeStartMenu();
  else openStartMenu();
});

document.addEventListener("click", (e) => {
  if (
    !(e.target as Element).closest("#start-menu") &&
    !(e.target as Element).closest(".tb-launcher")
  ) closeStartMenu();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && startMenu.classList.contains("sm-open")) closeStartMenu();
});

buildStartMenu();

// Wire Konsole in the start menu to the real terminal
APP_ACTIONS["konsole"] = () => { openOrSpawn(); closeStartMenu(); };

// ── Desktop icon drag ─────────────────────────────────────────────────────────
const ICON_POS_KEY = "icon-pos-konsole";
const savedIconPos = JSON.parse(localStorage.getItem(ICON_POS_KEY) ?? "null");
termIcon.style.left = `${savedIconPos?.x ?? 20}px`;
termIcon.style.top  = `${savedIconPos?.y ?? 20}px`;

let iconDrag = false;
let iconDragOX = 0, iconDragOY = 0;
let iconStartX = 0, iconStartY = 0;
let iconMoved = false;

termIcon.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;
  e.stopPropagation();
  iconDrag    = true;
  iconMoved   = false;
  iconDragOX  = e.clientX - termIcon.offsetLeft;
  iconDragOY  = e.clientY - termIcon.offsetTop;
  iconStartX  = e.clientX;
  iconStartY  = e.clientY;
  termIcon.classList.add("dragging-icon");
});

window.addEventListener("mousemove", (e) => {
  if (!iconDrag) return;
  if (Math.abs(e.clientX - iconStartX) > 4 || Math.abs(e.clientY - iconStartY) > 4) {
    iconMoved = true;
  }
  if (!iconMoved) return;
  const maxX = window.innerWidth  - termIcon.offsetWidth;
  const maxY = window.innerHeight - TASKBAR_H - termIcon.offsetHeight;
  termIcon.style.left = `${Math.max(0, Math.min(maxX, e.clientX - iconDragOX))}px`;
  termIcon.style.top  = `${Math.max(0, Math.min(maxY, e.clientY - iconDragOY))}px`;
});

window.addEventListener("mouseup", () => {
  if (!iconDrag) return;
  iconDrag = false;
  termIcon.classList.remove("dragging-icon");
  if (iconMoved) {
    localStorage.setItem(ICON_POS_KEY, JSON.stringify({
      x: termIcon.offsetLeft,
      y: termIcon.offsetTop,
    }));
    // Suppress the click that fires after a drag
    termIcon.addEventListener("click", (e) => e.stopImmediatePropagation(), { once: true, capture: true });
  }
});

// ── Auto-open terminal on page load (floating, never maximized) ──────────────
openOrSpawn();
