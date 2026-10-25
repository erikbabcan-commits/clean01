# Changelog

## 1.0.0 — 2026-10-24
### Pridané
- PWA: manifest, ikony, service worker, offline, toast aktualizácie.
- Úvodná obrazovka pre mobil/tablet (studený štart alebo po 60 min v pozadí) s mikroanimáciou `--H4CK3D--`.
- Lokálny skener projektov (`npm run server`).
- Perzistencia importovaných zdrojov, skratka ⌘K / Ctrl+K / „/“.
- Bezpečnostné hlavičky a CSP (`vercel.json`), CI workflow, 38 testov.
- Dokumentácia v `docs/`.

### Opravené
- 22 TypeScript chýb (vrátane chybného typu ikony v `SourceCard`).
- Zastaraný `ReactDOM.render` → `createRoot` + `StrictMode`.
- Falošné priradenie kategórie „AI“ (napr. „email“, „detail“).
- Neplatný default rate-limitu GitHubu, chýbajúca validácia odpovedí lokálneho servera.

### Zmenené
- Fonty self-hosted namiesto Google Fonts.
- Zoom blokovaný iba v nainštalovanej PWA.
- Zdieľaný komponent filtrov pre sidebar a mobil.
