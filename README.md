# ⛓ HabitChain — Build Streaks That Stick

> **No login. No app. No BS.** Visual habit chains that live in your browser.

![HabitChain Screenshot](assets/preview.png)

## 🔗 Live Demo

**[→ View Live on GitHub Pages](https://YOUR-USERNAME.github.io/habit-chain/)**

---

## What It Is

HabitChain is a zero-friction habit tracker that runs entirely in your browser. Your streaks are saved to `localStorage` — no account, no server, no subscription. Just open the page and start building chains.

Built for the productivity crowd who wants a system that doesn't get in the way.

---

## Features

- **Add 3–7 habits** with custom emoji icons and names
- **Daily checkboxes** — tap to mark a habit done, streak updates instantly
- **Visual chain links** — see your last 21 days as satisfying amber chain links
- **Monthly heatmap** — GitHub-style calendar showing completion intensity by day
- **Streak counter** — consecutive day streaks per habit
- **Win Logger** — jot down small daily wins alongside your habits
- **Motivational quote rotator** — curated quotes, auto-rotates every 30s
- **Export as PNG or PDF** — snapshot your progress with html2canvas + jsPDF
- **Share button** — copies the app URL to clipboard instantly
- **Dark / Light mode** — toggle with one click, preference saved
- **Mobile-first responsive** — looks great on phone and desktop
- **Offline-ready** — no network required after first load
- **localStorage persistence** — data survives page refreshes and browser restarts

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Markup | HTML5 |
| Styling | Tailwind CSS (CDN) + custom CSS |
| Logic | Vanilla JavaScript (ES2022) |
| Fonts | Syne + DM Mono (Google Fonts) |
| Export | html2canvas + jsPDF (CDN) |
| Storage | `localStorage` |
| Hosting | GitHub Pages |

Zero build step. Zero dependencies to install.

---

## Getting Started (Local)

```bash
# Clone the repo
git clone https://github.com/YOUR-USERNAME/habit-chain.git
cd habit-chain

# Open directly in browser
open index.html

# Or serve with any static server
npx serve .
```

---

## Deploy to GitHub Pages

1. Push this folder to a GitHub repo
2. Go to **Settings → Pages**
3. Set source to `main` branch, root `/`
4. Done — live at `https://YOUR-USERNAME.github.io/habit-chain/`

---

## Project Structure

```
habit-chain/
├── index.html          # Single-page app
├── README.md
├── css/
│   └── style.css       # Custom styles + CSS variables
├── js/
│   └── app.js          # All logic (habits, heatmap, export, storage)
└── assets/
    └── preview.png     # Screenshot for README
```

---

## Roadmap / Future Ideas

- [ ] Custom themes (forest, ocean, midnight)
- [ ] Habit notes / journal entries per day
- [ ] Weekly summary email (mailto: link)
- [ ] iCal / reminder integration
- [ ] Sharable read-only streak cards
- [ ] Pro tier: unlimited habits + custom watermark removal

---

## License

MIT — do whatever you want with it.

---

## Created By

**Chris Green** — [@chrisgreen](https://x.com/chrisgreen)

> *"Don't break the chain." — Jerry Seinfeld*
