# Světové hodiny

Jednostránková aplikace (vanilla JS, žádný build krok), která zobrazuje **živý čas našeho serveru**
a přehled času ve vybraných městech světa. Vše běží v Dockeru.

![stack](https://img.shields.io/badge/stack-vanilla%20JS%20%2B%20Node%20http-7b8cff) ![docker](https://img.shields.io/badge/docker-compose-3ce0c4)

## Spuštění

```bash
docker compose up -d --build      # appka na http://localhost:8080
docker compose logs -f hodiny     # logy
docker compose down               # zastavení
```

Jiná port nebo časové pásmo serveru:

```bash
HOST_PORT=9000 SERVER_TZ=America/New_York docker compose up -d --build
```

Testy a rychlý start bez Dockeru:

```bash
npm test                         # smoke test API + syntax control (7 testů)
npm start                        # http://localhost:3000
```

Testy se pouštějí i přímo v build stage Dockeru, takže se broken build nedostane do image.

## Architektura

```
hodiny/
├─ Dockerfile              # two-stage build (testy → runtime), node:24-alpine, non-root
├─ docker-compose.yml      # porty, TZ, healthcheck, limity, read-only fs
├─ server/index.js         # node:http — statický overflow + JSON API (0 závislostí)
├─ test/api.test.js        # node:test smoke test API
└─ public/                 # single page app
   ├─ index.html
   ├─ styles.css           # design tokeny, glassmorphism, tmavý/světlý režim
   └─ app.js               # render hodin, překupy pásem přes Intl
```

Proč to tak je: hodinám nelze věřit času prohlížeče (uživatel ho může mít špatně).
Klient si proto od serveru vyžáduje `GET /api/time`, spočítá posun (`skew`) oproti svému
hodinám a pak tiká lokálně; každých 30 s se znovu seřídí. Přepočet mezi IANA pásmy
dělá `Intl.DateTimeFormat`, takže aplikace nepotřebuje žádnou timezone knihovnu.

## API

| Endpoint      | Výstup                                                            |
| ------------- | ----------------------------------------------------------------- |
| `GET /api/time` | `epochMs`, `isoUtc`, `timeZone`, `offsetMinutes`, `isDst`         |
| `GET /api/info` | hostname, platform, CPU, load, paměť, `uptimeSeconds`, `serverTimeZone` |
| `GET /api/health` | `{ status: "ok", uptime }` — používá to Docker healthcheck     |

## Funkce aplikace

- **Hlavní karta serveru** — velké digitální hodiny s vteřinami, ručičkový ciferník,
  datum česky, pásmo, UTC offset a stav letního času, plus strip metrik serveru
  (uptime, hostname, Node, CPU/load, paměť).
- **Města** — výchozí přehled (Praha, UTC, Londýn, New York, Los Angeles, Tokio,
  Dubaj, Singapur, São Paulo, Sydney) lze libovolně přidávat odebírat.
- **Každá karta** — analog + digitální čas, den/noc (☀/☾), posun oproti serveru
  (`+2 h`, `stejný čas`), UTC offset, poloha v cyklu dne a označení *dnes / zítra / včera*.
- **Ovládání** — filtrování (`/` fokus na vyhledávání), řazení podle pásma nebo názvu,
  přepínač 12/24 h, světlý a tmavý režim. Volby se drží v `localStorage`.
- **Odolnost** — když `/api/time` není dostupné, aplikace přepne na čas prohlížeče
  a stav poctivě označí; při obnovení se sama seřídí.
- **Odkazy pro sdílení** — nastavení lze předat v URL, takže server může nabídnout
  rovnou výhled: `http://localhost:8080/?theme=light&format=12&tz=Asia%2FTokyo&pick=1`
  (parametry `theme`, `format`, `sort`, `tz`, `pick`; mají přednost před `localStorage`).

## Poznámky k běhu v Dockeru

- `TZ` v composu určuje, které pásmo server aplikace hlásí. Výchozí `Europe/Prague`;
  `SERVER_TZ=UTC docker compose up` dostane Univerzální čas.
- Image nemá žádné npm závislosti, takže je malý (`node:24-alpine` + ~120 kB kódu);
  běží jako ne-root uživatel `node` na read-only root fs s `cap_drop: ALL`.
- Zdravotní kontrola sahá na `/api/health`; dokud neprojde, container je `starting`.
