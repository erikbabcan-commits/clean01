# Architektúra

## Štruktúra

```
src/
├── index.tsx                 # vstup: fonty, createRoot, StrictMode, ErrorBoundary, UpdatePrompt
├── App.tsx                   # layout, stav filtrov/výberu/tabov, WelcomeScreen
├── data/projects.ts          # statické projekty + typy (Project, ProjectCategory, …)
├── lib/
│   ├── filter.ts             # filtrovanie, triedenie, zoskupenie podľa mesiaca, konštanty filtrov
│   ├── category.ts           # odvodenie kategórie z textu (regex s hranicami slov)
│   ├── github.ts             # GitHub API klient + odvodenie status/maturity
│   ├── sources.ts            # mapovanie GitHub/Vercel/Local → Project, mergeProjects, fetch Vercel/Local
│   ├── url.ts                # safeExternalUrl (len http/https), displayHost
│   ├── storage.ts            # bezpečný localStorage wrapper (prefix h4ck3d:)
│   ├── splashPolicy.ts       # kedy prehrať úvodnú obrazovku (sessionStorage + 60 min)
│   └── date.ts               # formátovanie dátumov
├── hooks/
│   ├── useProjectSources.ts  # importované zdroje + perzistencia + merge
│   ├── useDialog.ts          # Escape, focus trap, návrat focusu
│   └── useWelcomeScreen.ts   # fázy úvodnej obrazovky
├── components/               # UI (TopBar, Sidebar, Timeline, ProjectCard, ProjectDetail, …)
│   ├── sources/              # SourcesView, SourcesModal, Vercel/Local konektory
│   └── ui/                   # Button, Chip, Badge, Toggle, TextField, MaturityBar, RiskBar
├── utils/nativeShell.ts      # zámok zoomu iba v standalone PWA
└── test/setup.ts             # jest-dom, polyfilly pre jsdom
server/local-scanner.mjs      # companion server (Node, bez závislostí)
scripts/generate-icons.mjs    # PWA ikony z public/favicon.svg (sharp)
```

## Dátový tok

```
data/projects.ts ─┐
GitHub API  → githubToProject ─┐
Vercel API  → vercelToProject ─┼→ mergeProjects → filterProjects → groupProjectsByYearMonth → Timeline
Local server → localToProject ─┘        ▲                 ▲
                         useProjectSources (localStorage)  FilterState (App)
```

- `mergeProjects` páruje podľa `repo:owner/repo`, potom `name:<lowercase>`; zlúči zdroje, tech (max 6) a odkazy.
- Stav je lokálny v Reacte (bez globálneho store). Perzistované sú iba importované zoznamy (`h4ck3d:v1:source:*`).

## Úvodná obrazovka

`useWelcomeScreen` → fázy `loading → running → fading → done`.

- Štart: `matchMedia('(max-width: 1023px)')` && `shouldPlay(lastActive)`.
- `visibilitychange`/`pagehide` zapisujú `lastActive` do `sessionStorage`; pri návrate po ≥ 60 min sa fáza resetne na `loading`.
- Obrázok: `new Image().decode()` vs. 800 ms timeout (čo príde skôr).

## Kľúčové rozhodnutia

| Rozhodnutie                                      | Dôvod                                           |
| ------------------------------------------------ | ----------------------------------------------- |
| Fonty cez @fontsource (self-host)                | bez requestov na Google (GDPR), fungujú offline |
| Precache len latin fontov, splash mimo precache  | menší SW (~470 kB); desktop splash nesťahuje    |
| Zoom lock iba v standalone                       | prístupnosť v prehliadači                       |
| Tokeny len v pamäti, po importe zahodené         | minimalizácia rizika úniku                      |
| `sessionStorage` pre splash                      | prežije reload, zmaže sa pri zatvorení appky    |
| CSP v `vercel.json`, zrkadlená do `vite preview` | jeden zdroj pravdy, chyby vidno lokálne         |
