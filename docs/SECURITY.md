# Bezpečnosť

## HTTP hlavičky (vercel.json)

| Hlavička                   | Hodnota / účel                                                                                                                                                                                                                                                              |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content-Security-Policy    | `default-src 'self'`; `script-src 'self'`; `style-src 'self'`; `img-src 'self' data:`; `connect-src 'self' https://api.github.com https://api.vercel.com http://localhost:* http://127.0.0.1:*`; `frame-ancestors 'none'`; `object-src 'none'`; `upgrade-insecure-requests` |
| Strict-Transport-Security  | 2 roky, includeSubDomains, preload                                                                                                                                                                                                                                          |
| X-Frame-Options            | DENY                                                                                                                                                                                                                                                                        |
| X-Content-Type-Options     | nosniff                                                                                                                                                                                                                                                                     |
| Referrer-Policy            | strict-origin-when-cross-origin                                                                                                                                                                                                                                             |
| Permissions-Policy         | kamera, mikrofón, poloha, platby, USB vypnuté                                                                                                                                                                                                                               |
| Cross-Origin-Opener-Policy | same-origin                                                                                                                                                                                                                                                                 |

Žiadne inline skripty ani štýly; všetky fonty a obrázky sú self-hosted.

## Tokeny

- GitHub PAT a Vercel token existujú iba v pamäti komponentu; po úspešnom importe sa vymažú. Nikdy sa neukladajú do `localStorage`, cookies ani logov.
- Posielajú sa výhradne na `api.github.com` / `api.vercel.com` (vynútené CSP).
- Odporúčanie: fine-grained GitHub token s _Metadata: read-only_; Vercel token s minimálnym scope a expiráciou.

## Uložené dáta

- `localStorage` `h4ck3d:v1:source:*` — importované projekty (názvy, popisy, URL, lokálne cesty). Na zdieľanom zariadení použi „Odpojiť“ alebo v chybovej obrazovke „Vymazať uložené dáta“.
- `sessionStorage` `h4ck3d:splash:lastActive` — čas poslednej aktivity.
- Všetko sa validuje pri čítaní; poškodené dáta = prázdny stav.

## Externé URL

Všetky odkazy z API idú cez `safeExternalUrl` → povolené iba `http:`/`https:` (blokuje `javascript:`, `data:`). Externé odkazy majú `rel="noopener noreferrer"`.

## Lokálny skener

Viaže sa iba na `127.0.0.1`, len čítanie (GET), CORS whitelist (dev porty + `CORS_ORIGINS`), iné originy dostanú 403. Viď [LOCAL-SCANNER.md](LOCAL-SCANNER.md).

## Hlásenie chýb

Bezpečnostný problém nahlás súkromne vlastníkovi repa, nie cez verejné issue.
