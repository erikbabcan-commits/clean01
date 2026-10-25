# Lokálny skener (`server/local-scanner.mjs`)

Node server bez závislostí, ktorý nájde projekty na disku a poskytne ich appke.

## Spustenie

```bash
npm run server                                   # ~/Projects
PROJECTS_DIR=~/code,~/clients npm run server     # viac priečinkov
CORS_ORIGINS=https://h4ck3d-dashboard.vercel.app npm run server   # pre produkčnú appku
```

| Premenná       | Predvolené                       | Popis                                                 |
| -------------- | -------------------------------- | ----------------------------------------------------- |
| `PROJECTS_DIR` | `~/Projects` (alebo 1. argument) | priečinky oddelené čiarkou                            |
| `PORT`         | `3001`                           | port                                                  |
| `HOST`         | `127.0.0.1`                      | adresa (nemeniť na `0.0.0.0`)                         |
| `SCAN_DEPTH`   | `2`                              | hĺbka hľadania                                        |
| `CORS_ORIGINS` | —                                | ďalšie povolené originy (dev porty 5173/4173 sú vždy) |

## Ako hľadá projekty

Priečinok je projekt, ak obsahuje `package.json` alebo `.git`. Preskakuje `node_modules`, `dist`, `build`, `.next`, skryté priečinky a pod.

Pre každý projekt vráti: `name` (z package.json bez scope, inak názov priečinka), `path`, `description`, `remoteUrl` (z `.git/config`), `lastCommitDate` (`git log -1`, inak mtime), `dependencies`.

## API

- `GET /api/local/projects` → `{ "projects": LocalProject[] }`, zoradené od najnovšieho commitu.
- `GET /health` → `{ ok, roots }`.

## Párovanie

`remoteUrl` (`git@github.com:owner/repo.git` aj https) sa normalizuje na `owner/repo` a spojí s GitHub a Vercel kartou.

## Riešenie problémov

- **„Lokálny server neodpovedá“** → beží `npm run server`? Správna adresa v appke?
- **403 Origin not allowed** → pridaj doménu appky do `CORS_ORIGINS`.
- **Chrome blokuje HTTPS → localhost** → server posiela `Access-Control-Allow-Private-Network: true`; v novších verziách Chrome potvrď výzvu na prístup k lokálnej sieti.
