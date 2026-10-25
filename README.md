# H4CK3D Project Timeline

PWA dashboard, ktorý spája statické projekty, GitHub repozitáre, Vercel projekty a lokálne priečinky do jednej timeline.

## Rýchly štart

```bash
npm ci
npm run dev        # http://localhost:5173
npm run server     # voliteľné: lokálny skener projektov na http://127.0.0.1:3001
```

## Skripty

| Príkaz            | Popis                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| `npm run build`   | typecheck + produkčný build (`dist/`, service worker, manifest)       |
| `npm run preview` | náhľad buildu s rovnakými security hlavičkami ako na Verceli          |
| `npm run check`   | format + lint + typecheck + testy + build (to isté ako CI)            |
| `npm test`        | Vitest (unit + render testy)                                          |
| `npm run icons`   | pregeneruje PWA ikony z `public/favicon.svg`                          |
| `npm run server`  | lokálny skener (`PROJECTS_DIR`, `PORT`, `SCAN_DEPTH`, `CORS_ORIGINS`) |

## Lokálny skener

```bash
PROJECTS_DIR=~/code,~/clients CORS_ORIGINS=https://tvoja-domena.sk npm run server
```

Počúva iba na `127.0.0.1`, je len na čítanie a CORS povolí iba dev porty + domény z `CORS_ORIGINS`.

## Nasadenie (Vercel)

`vercel.json` obsahuje build, SPA rewrite, CSP a ďalšie security hlavičky a cache pravidlá (immutable assety, revalidácia `sw.js`/`index.html`).
Ak pridáš nové API (napr. analytiku), doplň doménu do `connect-src` v CSP.

Kompletná dokumentácia je v [`docs/`](docs/README.md).

## Bezpečnosť a dáta

- Tokeny (GitHub, Vercel) sú iba v pamäti a po importe sa zahodia; nikdy sa neukladajú.
- Importované projekty (bez tokenov) sa ukladajú do `localStorage`, aby timeline prežila reload aj offline štart.
- Všetky odkazy z API idú cez `safeExternalUrl` (iba http/https).
- Zoom je blokovaný len v nainštalovanej PWA; v prehliadači ostáva dostupný (WCAG 1.4.4).
