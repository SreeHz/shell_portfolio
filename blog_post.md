# I Built a Terminal Portfolio and Now I Can't Stop Typing `help` 🖥️

> *A story of questionable life decisions, sarcastic error messages, and an unhealthy obsession with monospace fonts.*

---

## The Origin Story (aka "What was I thinking?") 🤔

So there I was, staring at yet another React portfolio template with a hero image, a floating navbar, and a "scroll down for more ✨" section. You know the one. You've seen a thousand of them. Recruiters have seen a *million* of them.

And then the thought hit me like a `Segmentation fault (core dumped)`:

> *"What if my portfolio... was a terminal?"*

Completely normal thought. Very sane. 10/10 would recommend.

The goal was simple:
- Make something memorable (✅ Achieved)
- Make it $0 to host forever (✅ GitHub Pages, baby)
- Make it a portfolio piece *inside* a portfolio (🤓 Yes, I did that)
- Maybe have some fun with it (✅ Chaos mode incoming)

---

## Phase 0: "Hello, World." (The Boring Part We All Pretend Is Exciting) 🏗️

**Commits:** `Phase 0: Vite + TypeScript scaffold` + deploy workflow

Every great project starts with the same cosmic ritual:

```bash
npm create vite@latest shell_portfolio -- --template vanilla-ts
```

*Eleven files. 1117 lines. Mostly `package-lock.json`.* Welcome to modern web development.

But here's the thing — I set up the **GitHub Actions deploy pipeline FIRST**, before writing a single line of actual app code. That's not procrastination, that's *engineering discipline*. (It's also definitely procrastination.)

The PLAN.md was born here too. A beautiful, optimistic document with checkboxes I was absolutely going to complete in the estimated timeframes. Narrator: *He did not.*

**Stack chosen:**
- 🍦 Vanilla TypeScript (no frameworks, because suffering is a choice)
- ⚡ Vite (because waiting for webpack is a form of psychological torture)
- 📄 GitHub Pages (because paying for hosting is for people with money)

---

## Phase 1: The Terminal Engine 🔧

**Commit:** `Phase 1: terminal engine — command registry, history, autocomplete`

This is where things got interesting. I built a custom terminal engine from scratch in ~200 lines. No xterm.js. No jQuery Terminal. Just vibes and TypeScript.

Here's what `terminal.ts` does, in order of "oh this was easy" to "why did I do this to myself":

| Feature | Vibe |
|---|---|
| Input handling + output log | 5 minutes, felt like a god |
| Auto-scroll to bottom | 10 minutes, still felt like a god |
| Command history (↑ / ↓) | 30 minutes, humbled |
| Tab autocomplete with common-prefix | 2 hours, questioning everything |
| Levenshtein "did you mean?" | Searched Wikipedia at 1am |

The "did you mean?" feature deserves a special mention. You type `projecst` and the terminal goes:

```
command not found: projecst — did you mean 'projects'? type 'help' to list commands.
```

Which is more helpful than most humans I know.

**The command registry pattern** was genuinely elegant (I'm allowed to compliment myself, this is my blog):

```typescript
// Each command is just a module. Adding a new command = adding a file.
// Phase 5 blog: trivial. Phase ∞ chaos mode: trivial. Chef's kiss.
```

---

## Phase 2: Actual Portfolio Content 📄

**Commits:** `Phase 2: portfolio content commands` + `Fill in real portfolio content`

Now the terminal had a brain. Time to give it something to *say*.

Commands added:
- `about` — who am I? (good question)
- `projects` — what have I built? (better question)
- `skills` — what can I do? (concerning question)
- `experience` — where have I worked?
- `education` — how did I get here?
- `contact` — how do you reach me?
- `socials` — same thing, different vibes
- `resume` — just opens a PDF like a normal person
- `awards` — yes I added this, yes I'm proud of it
- `banner` — the ASCII art welcome screen nobody asked for

The **ASCII art banner** running on boot? That's `figlet` energy without the `figlet` dependency. Hand-crafted. Artisanal. Completely unnecessary. *Absolutely staying.*

Fun fact: `content/profile.json` started as a file full of `"EDIT"` placeholders. It looked like a ransom note. Then I replaced it with real resume content — Amazon QSA experience, CMRL internship, Sri Sairam Institute education, actual awards — and suddenly it felt *real*.

That moment when your fake portfolio content becomes your real portfolio content is genuinely surreal. Would recommend.

---

## Phase 3: Polish (The Phase That Never Ends) ✨

**Commit:** `Phase 3: themes, typing animation, mobile UX, SEO, favicon, 404`

This is the phase where "I'll just add one more thing" turns into 305 lines of CSS variables and you start having opinions about focus rings.

### Themes 🎨

Five themes. Because four wasn't enough and six was too many.

```
dark     — the default, obviously
light    — for people who hate themselves
dracula  — for the aesthetic
gruvbox  — for the vim users who found the website somehow  
matrix   — for when you want to feel like a hacker at 3am
```

All persisted in `localStorage`. The terminal remembers your theme across sessions, which is honestly more reliable than my memory.

### Typewriter Animation ⌨️

The banner tagline types itself out on load. Slow. Deliberate. Satisfying. Like watching `git clone` on a fast connection — you know it's going to be fine but you *watch it anyway*.

Respects `prefers-reduced-motion` too, because accessibility matters and also I read the MDN docs and felt obligated.

### Mobile UX 📱

Here's the thing about mobile terminal portfolios: nobody asked for one. And yet here we are, making sure the banner scales to fit narrow viewports, using `100dvh` instead of `100vh` (Safari, you know what you did), and adding quick-command chips so touch users can tap `about` instead of typing it.

The quick-command chips are peak "this is either genius or overkill" energy. I still can't decide which.

### The 404 Page 💀

```
bash: cd: /page-you-wanted: No such file or directory
```

A 404 page that looks like a terminal error. Because if you're going to 404, at least *commit to the bit*.

### SEO + OpenGraph 🔍

Added JSON-LD Person schema, OpenGraph tags, Twitter cards, and a real screenshot as the OG image. Recruiters sharing links to my portfolio now get a nice preview card. You're welcome, recruiters.

---

## Phase 4: Ship It 🚀

**Commit:** `Phase 4: ship — Lighthouse 100s, robots.txt, README with demo GIF`

**Lighthouse scores: 100 / 100 / 100 / 100.**

Let me just... leave that there.

The only thing blocking perfect scores? Missing `robots.txt`. Two lines of text. TWO. LINES.

```
User-agent: *
Allow: /
```

That's it. That's the fix. I sat there for a moment just staring at the Lighthouse report thinking about all the complex optimizations I *could* have needed to do, and then I just... typed those two lines.

The README got a demo GIF recorded in-browser (`docs/demo.gif` — 1MB of pure terminal energy). Because a portfolio without a demo GIF is just... a repo.

---

## The Blog Command That Replaced a Whole Phase 📝

**Commit:** `Add blog command linking to external blog site`

Phase 5 in the original plan was an in-repo blog: Markdown files, a build step to parse them, a `blog read <slug>` command, maybe RSS. Noble ambitions.

What actually shipped:

```typescript
export const blog: Command = {
  name: "blog",
  description: "open my blog",
  run(_args, ctx) {
    window.open("https://blog.raswanth.workers.dev/", "_blank", "noopener");
    ctx.print("opening blog...");
  },
};
```

Three lines. One command. The blog lives elsewhere now (on Cloudflare Workers, because of course it does). Sometimes the right engineering decision is "just open a URL." It's not giving up. It's *scope management*. It's *agile*. I'm telling myself this and I'm moving on.

---

## The Final Boss: Multi-Window Desktop 🖥️🖥️

**Commit:** `Overhaul UI: multi-window desktop, snap zones, tabulated commands, merged contact`

And then I woke up one day and thought: *"What if the terminal portfolio... was a multi-window desktop environment?"*

Again: completely normal thought. Very sane.

**What shipped in one commit (1,765 lines changed, lol):**

### Multi-Window System 🪟
- Double-click the desktop icon → spawns a new terminal window
- Maximum 2 windows (a reasonable adult decision)
- Each window is its own independent terminal session
- Closing a window destroys the session completely

### Snap Zones 🧲
Drag a titlebar to:
- **Top edge** → fullscreen snap (with ghost preview animation)
- **Left edge** → left-half snap
- **Right edge** → right-half snap

Complete with animated ghost overlays showing you where it'll land. Because if you're building a fake desktop environment, you might as well make it feel *real*.

### The Notification System (My Personal Favorite) 🔔

Try to open a **third window**.

Go ahead. I'll wait.

You can't. And instead of a boring "maximum windows reached" dialog, you get a sarcastic toast notification from the bottom-right corner. Each notification has its own 5-second drain bar and collapses independently. Multiple rapid attempts stack — each notification is *its own insult*.

It's technically a notification system. It's spiritually a roast system.

### Chaos Mode 🔥

Type `rm -rf /` in the terminal.

I won't spoil it completely, but here's a sample of the post-chaos error messages you get for any subsequent command:

```
"You are the reason sysadmins drink."
"Attempting 'ls'... lol. No."
"I am a grub rescue terminal. I have one job: survive your stupidity. It's hard."
"'pwd'? You deleted everything and NOW you want to run commands? Brave."
```

The chaos mode has 30+ unique sarcastic responses. I wrote all of them at some point between 8pm and midnight. I have no regrets.

Type `reboot` to fix it. (Or just... refresh the page. But where's the fun in that?)

### Unix Commands 🐧

Added `whoami`, `pwd`, `uptime`, `neofetch` (yes, a real terminal-style system info output), `ls`, `cat`, `man`, `uname`, `date`, `echo`, `env`. 

Real commands. Fake filesystem. Peak terminal energy.

```bash
$ whoami
raswanth

$ pwd
/home/raswanth/portfolio

$ uptime
42 min 13 sec — Terminal has been running since you opened this tab.
```

### Tabulated Commands 📊

`projects`, `skills`, and `experience` now render as proper ASCII tables using a `cmd-table` helper. Because if you're going to list things, you might as well list them with column alignment.

### Help Redesigned 📖

Help went from a simple list to a two-column CSS grid layout — author commands vs system commands — with per-column description alignment. It's the kind of thing you spend 45 minutes on and only 3 people will notice, but those 3 people will appreciate it deeply.

---

## The Numbers 📊

| Phase | Commits | Lines Added | Vibe |
|---|---|---|---|
| Phase 0 | 2 | ~1,117 | "Hello World" energy |
| Phase 1 | 1 | ~322 | Actually building things |
| Phase 2 | 2 | ~580 | Content go brrr |
| Phase 3 | 2 | ~427 | Polish spiral begins |
| Phase 4 | 1 | ~62 | Lighthouse perfectionism |
| Blog cmd | 1 | ~15 | Scope management champion |
| Final overhaul | 1 | ~1,765 | Send help |
| **Total** | **10** | **~4,288** | **Worth it** |

---

## What I Actually Learned 🎓

**Technical stuff:**
- CSS variables + `localStorage` = effortless theming that survives page reloads
- Levenshtein distance is genuinely useful and surprisingly simple to implement
- `100dvh` instead of `100vh` — Safari will thank you (or at least stop breaking)
- GitHub Actions + GitHub Pages = free CI/CD pipeline, no excuses
- Building your own terminal engine is a portfolio piece *within* a portfolio piece. It's turtles all the way down.

**Softer stuff:**
- The "did you mean?" feature got more compliments than any visual element
- Sarcastic error messages make people *stay on the page longer*. I'm not sure what this says about humanity.
- Ship the boring version first, overhaul it later. That's just how it goes.
- Sometimes the best feature is the one that took 30 seconds to implement (the blog command).
- Sometimes the best feature took 1,765 line changes and a weekend (the desktop).

---

## What's Next? 🔮

The original Phase 5 blog plan (in-repo Markdown posts) is still sitting there in PLAN.md with an unchecked checkbox, mocking me gently. Maybe someday.

In the meantime: the terminal lives, the chaos mode awaits new victims, and somewhere a recruiter is typing `help` and not sure why they can't stop.

Mission accomplished. 🏁

---

## Try It Yourself

You probably know where to find it. If not: type `blog` in my portfolio terminal, which will bring you... here. Which means you came from there. Which is a loop. You're welcome.

---

*Built with TypeScript, Vite, GitHub Pages, an unhealthy amount of sarcasm, and zero regrets.*

*— Raswanth*
