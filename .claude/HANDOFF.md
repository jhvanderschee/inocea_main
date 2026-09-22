# Handoff: Inocea-theme

Stand van 22 september 2026.

## Wat het is

`inocea_main` is de moederrepo van het gedeelde Hugo-theme voor de Inocea-sites.
Het theme zelf staat in `themes/inocea/`; alles daarbuiten (content, data,
uploads, logo) is SATA-vulling zodat je het theme kunt draaien en bekijken. Aan
deze repo hangt geen productiesite.

Elke site is een eigen repo met exact dezelfde vorm: een gewone Hugo-site met een
kopie van het theme in `themes/inocea/`. Geen submodule, geen Hugo-module, dus
het CMS van Joost merkt er niets van. Sites nu op het theme: `davie_autonomous`,
`davie_enigma`, `gulfcopper`. De oude Gulf Copper staat op branch `pre-theme`.

## Wat waar hoort

Theme (`themes/inocea/`): layouts, CSS, JS, fonts, iconen, chrome-afbeeldingen
(pijlen, menu), `hugo.yml` (mounts, nodig voor de svg-sprite), `theme.yml`.

Site: `hugo.yml`, `content/`, `data/`, `static/uploads/`, `static/img/logo.svg`
en favicon, `static/css/custom.css`, `static/js/custom.js`, en als enige
layout-override `layouts/_partials/logo.html`.

Regels:

- Alles gelijk behalve content. Een site krijgt nooit eigen layouts.
- Site-eigen CSS gaat in `custom.css` en bestaat uit `:root`-token-overrides
  (bijv. `--logo-width: 6rem`) of een klein gescoopt blok. Geen selectoren
  uit `style.css` kopiëren.
- Tracking-tags (LinkedIn e.d.) staan in `custom.js` van de site, niet in het theme.
- Site-verschillen die het theme moet kennen lopen via `params` in `hugo.yml`:
  `header_icon` (merk-icoon boven de homepage-header) is het voorbeeld.
- Data-bestanden hebben in elke site dezelfde keys als in `inocea_main/data/`.

## Synchroniseren

`sync-theme.sh` staat in de root van `inocea_main` en draait altijd van daaruit.
Het staat niet in de sites.

```
./sync-theme.sh down ../site [--yes]   theme naar de site (dry-run, dan bevestigen)
./sync-theme.sh up   ../site <pad>...  bestand uit de site terug naar main
./sync-theme.sh diff ../site           verschillen in beide richtingen
```

- `down` weigert als `inocea_main` ongecommitte wijzigingen heeft, en schrijft
  `themes/inocea/VERSION` (commit-hash + datum) in de site. Daarna in de site
  committen: "Theme bijgewerkt naar inocea_main <hash>".
- `up` kopieert alleen; committen in `inocea_main` doe je zelf. Paden mogen met
  of zonder `themes/inocea/` ervoor.
- `diff` vergelijkt op inhoud; "geen verschillen" betekent dat de site gelijkloopt.

Dagelijkse loop bij een theme-wijziging vanuit een site:

1. Wijzig in `themes/inocea/` van de site, zodat je het direct ziet.
2. `../inocea_main/sync-theme.sh up . <pad>`, in `inocea_main` bekijken met
   `hugo server`, committen.
3. `down` naar deze site en naar de andere sites; per site committen.

Nooit een site committen met theme-wijzigingen die niet in `inocea_main` zitten:
de volgende `down` gooit ze weg.

## Nieuwe site

Skill `inocea-nieuwe-site` (in `.claude/skills/`, reist mee naar sites). Kort:
kopie van `inocea_main` zonder `.git`, `sync-theme.sh`, `README.md` en de
SATA-content; `hugo.yml` aanpassen; data-bestanden tot placeholders; logo
vervangen; `git init`; bouwen; committen.

## Bekende open punten

Theme:

- `site.Data` is in Hugo 0.156+ deprecated ten gunste van `hugo.Data`; Joost
  koos bewust `site.Data`. Afstemmen welke Hugo-versie het CMS draait.
- `.Site.AllPages` in `home.json` geeft dezelfde warning; `hugo --minify` faalt
  op dat bestand (JS in JSON).
- Horizontale overflow op 375px (bestond al voor het theme).
- `facility.html` crasht als een site de shortcode gebruikt zonder
  `/img/facility.png`; `layouts/facility/page.html` is leeg.
- `logo.html` wordt twee keer inline gerenderd (dubbele SVG-id's).
- 404-tekst valt onder de vaste header.
- Uit Gulf Copper: tegeltitels klein en lege `<p>` bij lege `markdown`;
  bigtext-achtergrond puur zwart i.p.v. `#1c1c1c`; `.wide` legt geen max-width
  op tekst; intro-brick eist een h1; grijs/wit per sectie niet forceerbaar.
- Footer-regel `ul:has(li:nth-of-type(7))` is een magic number.
- `marker.svg` en `map.svg` worden nergens gebruikt.

Sites:

- LinkedIn partner-id `9574716` staat in SATA, Autonomous én Enigma; nagaan of
  dat één account is. De `<noscript>`-pixel is bij de verhuizing naar
  `custom.js` weggevallen.
- Careers bij Gulf Copper is een externe link naar Humanic; er is geen feed
  (onderzocht: geen RSS, geen CSV, paginering achter ajax).

## Werkwijze in deze repo

Fable orkestreert, agents typen (skill `odf-orchestrator`): elke wijziging via
een agent in een worktree, diff lezen, mergen, bouwen op main. Weinig commentaar
in code: hooguit één korte NL-regel. Geen klant-copy verzinnen bij het vullen
van pagina's; alleen brontekst. Niet pushen zonder go.
