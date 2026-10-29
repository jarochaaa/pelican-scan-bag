# Pelican · Scan Bag (prototype)

Clickable prototype of the "Scan Bag V1" picker flow (Pack, Scan & Dispatch) for Pelican, built from the Pelican 3.0 Figma file.

- Tap **Continue checkout** → **Scanner** (each tap is a simulated successful scan: location → bags → 2nd location).
- Slide a location with bags to delete it; empty locations use the "Delete location" button.
- On a phone: open the link, then *Share → Add to Home Screen* to run it full-screen without browser UI.

```bash
npm install
npm run dev
npm run deploy   # builds and publishes dist/ to the gh-pages branch
```

## Desktop board (≥ 1100px)
Title card (Pelican · Mobile app · User: Pickers · area · live View code), floating collapsible navigator (Use cases / Edge cases / Pelican presets, each row `CODE label`), and a side column (View tag → App language EN/ES/AR → Facilitator hints). Phones and tablets show only the app. The orange task strip is off by default: set `SHOW_TASK_BANNER = true` in `src/tasks.ts` to bring it back.
