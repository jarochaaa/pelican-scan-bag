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
