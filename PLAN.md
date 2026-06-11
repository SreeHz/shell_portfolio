# Terminal Portfolio — Project Plan

A portfolio website that looks and behaves like a terminal. Visitors type
commands (`about`, `projects`, `contact`, ...) to explore. Total cost: $0,
forever — hosted on GitHub Pages, content stored as files in the repo.

## Stack

- **Frontend:** Vanilla HTML/CSS/TypeScript, built with Vite. The terminal
  is custom-built (no xterm.js / jQuery Terminal) — it's ~200 lines and a
  portfolio piece in itself.
- **Hosting:** GitHub Pages, auto-deployed by GitHub Actions on push to `main`.
- **"Database":** JSON and Markdown files in `content/`. Editing content is
  a git commit — version-controlled, free, no server.
- **Contact:** `mailto:` link (or Formspree free tier if a real form is wanted).
- **Analytics (optional):** GoatCounter — free, no cookie banner needed.
- **Domain:** `<user>.github.io` free; `is-a.dev` or `js.org` for a free
  custom subdomain. A paid domain is optional, never required.

## Planned repo structure

```
shell_portfolio/
├── index.html
├── src/
│   ├── main.ts            # boot: banner, focus, wire input
│   ├── terminal.ts        # engine: input, output log, history, autocomplete
│   ├── commands/          # one module per command, registered in an index
│   │   ├── index.ts       # command registry
│   │   ├── help.ts
│   │   ├── about.ts
│   │   ├── projects.ts
│   │   └── ...
│   └── styles/
├── content/
│   ├── projects.json
│   ├── profile.json       # about/skills/experience/education/socials
│   ├── resume.pdf
│   └── blog/              # Phase 5: markdown posts
├── public/                # favicon, og image
└── .github/workflows/deploy.yml
```

---

## Phase 0 — Foundation (~½ day)

- [x] Create GitHub repo, `git init`, first commit — https://github.com/SreeHz/shell_portfolio
- [x] Scaffold Vite + TypeScript project
- [x] GitHub Actions workflow: build + deploy to GitHub Pages on push to `main`
- [x] Verify "hello world" is live at https://sreehz.github.io/shell_portfolio/

Deployment works before any real code exists — it's never a question mark later.

## Phase 1 — Terminal engine (1–2 days)

- [x] Layout: full-screen terminal, output area + prompt line, monospace font
- [x] Input handling: Enter executes, output appends, auto-scroll to bottom
- [x] Command registry: `{ name, description, run(args): output }` — each
      command a self-contained module (this is what makes `blog` trivial later)
- [x] `help` (auto-generated from registry), `clear` (and Ctrl+L)
- [x] Unknown command → "command not found, did you mean X? type `help`"
- [x] Command history with ↑ / ↓
- [x] Tab autocompletion for command names (incl. common-prefix completion)
- [x] Click anywhere focuses the input

## Phase 2 — Portfolio content (1–2 days)

- [x] `content/profile.json` + `content/projects.json` data files
- [x] Commands: `about`, `projects` (+ `projects <name>` for detail), `skills`,
      `experience`, `education`, `contact`, `socials`
- [x] `resume` — opens PDF from the repo (graceful message until
      `public/resume.pdf` is added)
- [x] ASCII-art welcome banner + "type `help` to get started" hint
- [x] Links in output are clickable (new tab, noopener)
- [x] Real content filled in from resume + summary (Amazon, CMRL, Sri Sairam,
      awards & certifications); `public/resume.pdf` added; `awards` command

## Phase 3 — Polish (1–2 days)

- [x] Typing animation for the banner tagline (instant under reduced motion)
- [x] Themes: `theme <name>` — dark, light, dracula, gruvbox, matrix —
      persisted in localStorage via CSS variables
- [x] Mobile: no auto-focus keyboard pop, scaled banner, dvh sizing,
      tappable quick-command chips on touch/narrow screens
- [x] SEO: title/meta/OpenGraph tags, og-image (real screenshot), JSON-LD
      Person schema, expanded `<noscript>` summary
- [x] Favicon (terminal `>_` SVG), 404 page styled as a shell error
- [x] Accessibility: aria-live output, :focus-visible outlines, reduced-motion

## Phase 4 — Ship (~½ day)

- [x] Lighthouse audit (perf / a11y / SEO) — 100/100/100/100 after adding
      `public/robots.txt`
- [x] Browser check: Chrome desktop + mobile-width viewport (chips, scaled
      banner, no console errors). Still manual: Firefox, Safari, real phone.
- [x] README with demo GIF (`docs/demo.gif`, recorded in-browser)

## Phase 5 — Blog (future)

- [ ] Posts as Markdown in `content/blog/` with frontmatter (title, date, tags)
- [ ] Build step parses markdown → JSON manifest (stays a static site)
- [ ] `blog` lists posts; `blog read <slug>` renders one in the terminal
- [ ] Optional: RSS feed generated at build time
- [ ] Optional: comments via giscus (GitHub Discussions backend — free)

## Free-cost guardrails

- Static site only — never add anything requiring a paid server.
- GitHub Pages limits (soft 100 GB bandwidth/mo, 1 GB site) are far beyond
  portfolio needs.
- All content/data lives in the repo; GitHub is the database.
