# Little Space

A mobile web app for finding a café seat on the Lower East Side — see how busy a café is right now, check its typical hours, share a quick crowd update, and trade points for perks.

Built from the **final** section of the Figma file (screens 01–09): Explore map → Café preview → Café details → Occupancy trends → Share an update (2 steps) → Confirmation → Rewards → Redemption.

## Run it

```bash
npm install
npm run dev        # open the Network URL on your phone (same Wi-Fi)
npm run build      # production build in dist/
```

On iPhone: open the site in Safari → Share → **Add to Home Screen**. It launches full-screen and works offline.

## How it works

- **No backend or database.** Café data lives in `src/lib/data.ts`; your points, updates and redeemed codes are saved on the device (`localStorage`).
- Status = the latest community update from the last 90 minutes, otherwise the café's typical pattern for this hour. Closed cafés show as closed.
- Times, “today”, and the “Now” bar use the phone's real clock.

## Stack

React 18 + TypeScript + Vite · Tailwind CSS · shadcn-style primitives (`cva`, `tailwind-merge`, Radix Slot) in `src/components/ui` · lucide icons (same set as the Figma) · Inter (bundled via Fontsource) · PWA via `vite-plugin-pwa`.

## Design tokens (from Figma)

| Token | Hex |
|---|---|
| Canvas | `#f8f7f2` |
| Ink | `#252e29` |
| Muted | `#6e776f` |
| Line | `#dfe3d9` |
| Brand / soft / deep | `#496952` / `#e8eee5` / `#354f3d` |
| Moderate / soft | `#936d32` / `#f3ecdc` |
| Very busy | `#a55f4c` |

Type: Inter 400/500/600 · titles 28/-0.7 · café name 25–26 · body 12–13 · buttons 16 Semi Bold, 54px pill.

## Deploy (GitHub Pages)

Pushing to `main` runs `.github/workflows/deploy.yml`. One-time setup: repo **Settings → Pages → Source: GitHub Actions**.
