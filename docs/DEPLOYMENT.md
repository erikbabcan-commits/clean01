# Nasadenie

## Vercel (prvé nasadenie)
1. vercel.com/new → tím **h4ck3d** → Import `erikbabcan-commits/clean01`.
2. Názov projektu `h4ck3d-dashboard`. Framework/build sa načítajú z `vercel.json` (`npm run build` → `dist`).
3. Deploy. Každý push na `main` = produkcia, PR = preview.

Alternatívne CLI: `npx vercel@latest deploy --prod --scope h4ck3d --yes`.

Premenné prostredia: **žiadne** nie sú potrebné.

## `vercel.json`
- SPA rewrite na `index.html` (okrem `/assets/` a súborov s príponou).
- Bezpečnostné hlavičky — viď [SECURITY.md](SECURITY.md).
- Cache: `/assets/*` 1 rok `immutable`; `sw.js`, `registerSW.js`, `workbox-*.js`, `manifest.webmanifest`, `index.html` → `max-age=0, must-revalidate`.

## Service worker a aktualizácie
- `registerType: 'prompt'` — nová verzia sa nenainštaluje potichu; používateľ dostane toast „Aktualizovať“.
- Pri zmene CSP pridaj novú doménu do `connect-src` (napr. analytika), inak requesty zlyhajú.

## CI (GitHub Actions — `.github/workflows/ci.yml`)
Na push do `main` a PR: `npm ci` → format:check → lint → typecheck → test → build → upload `dist` artefaktu (7 dní).

## Rollback
Vercel → Deployments → predchádzajúci deployment → **Promote to Production**. Používatelia PWA dostanú toast s aktualizáciou.

## Kontrola po nasadení
- [ ] `curl -I https://<url>` obsahuje `Content-Security-Policy`, `Strict-Transport-Security`.
- [ ] DevTools → Application → Manifest bez chýb, SW aktívny.
- [ ] Mobil: úvodná obrazovka pri prvom otvorení, nie pri reloade.
- [ ] Konzola bez CSP chýb.
