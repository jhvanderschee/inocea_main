---
name: inocea-sync
description: Werken in een Inocea-site zonder dat de kopie van het theme zijn eigen leven gaat leiden — een wijziging naar het theme halen met sync-theme.sh up, site-eigen CSS/JS in custom.css/custom.js, of het theme bijwerken met diff en down. Triggert met "/inocea-sync", "dit moet naar het theme", "theme bijwerken", "site-specifieke css", "nieuwe sectie", "dit geldt voor alle sites".
---

## Bepaal waar je bent

Elke Inocea-repo is een gewone Hugo-site met het theme als kopie in `themes/inocea/`.

- **Theme-repo** (`inocea_main`): `themes/inocea/theme.toml` bestaat *en* er is een `bin/`
  met `sync-theme.sh`. Hier woont het theme; hier commit je theme-wijzigingen.
- **Site**: wel `themes/inocea/VERSION`, geen `bin/sync-theme.sh`. De theme-repo staat dan
  op `../inocea_main` — controleer met `ls ../inocea_main/bin/sync-theme.sh`; ontbreekt die,
  vraag Guus waar hij staat.

`sync-theme.sh` draai je altijd vanuit de theme-repo; `<site>` is het pad daarheen
(`../<naam>`). Sta je in de site, dan: `../inocea_main/bin/sync-theme.sh … .`

## a. Het zit in het theme (sectie, CSS, JS, layout)

Alles wat niet één site-eigen kleurtje is, hoort in het theme.

```bash
# 1. wijzig in themes/inocea/ van de site, zodat je het direct in deze site ziet
hugo server                  # in de site

# 2. haal de gewijzigde bestanden terug (vanuit de theme-repo)
bin/sync-theme.sh up <site> static/css/style.css layouts/_partials/sections/nieuw.html

# 3. bekijken en testen in de theme-repo
git diff && hugo server

# 4. committen
git commit -am "…"

# 5. terug naar de site (werkt VERSION bij)
bin/sync-theme.sh down <site>
```

Nieuwe sectie? Dan hoort er ook een regel bij in `params.sections` van elke site die hem
gebruikt — die regel staat in de `hugo.yml` van de site, niet in het theme. Eerste match
wint, dus let op de volgorde. Rol daarna de andere sites bij met dezelfde `down`.

## b. Het geldt alleen voor deze site

Alleen deze twee bestanden van de site, buiten `themes/inocea/`:

- `static/css/custom.css` — overschrijf de `:root`-tokens uit `style.css` (kleuren, fonts,
  maten). Kopieer geen selectoren uit het theme; gescoopte extra's mogen, klein houden.
- `static/js/custom.js` — alleen echt site-eigen gedrag.

Blijkt het eigenlijk een theme-instelling te moeten zijn (een aan/uit, een naam, een id —
zoals `header_icon` of `linkedin_partner_id`), stel dan voor er een param van te maken:
`{{ with site.Params.… }}` in het theme, de waarde in de `hugo.yml` van de site. Dat is
route a.

## c. Theme bijwerken in deze site

```bash
bin/sync-theme.sh diff <site>   # beide richtingen
bin/sync-theme.sh down <site>
```

Staat er in de onderste helft van `diff` iets dat alleen in de site bestaat, dan is er
theme-code in de site aangepast zonder `up`. Maak eerst route a af, anders gooit `down` het
weg. Vertel voor de bevestiging kort wat er verandert: welke bestanden, en of het layouts,
CSS of JS raakt.

## Harde regels

- Nooit layouts in de site-root aanmaken. Uitzondering: `layouts/_partials/logo.html`.
- Nooit `themes/inocea/` in een site committen met wijzigingen die niet in het theme zitten.
- Na afloop is `themes/inocea/VERSION` een bestaande theme-commit: controleer met
  `git -C ../inocea_main cat-file -e $(head -1 themes/inocea/VERSION)`.
- `down` weigert als de theme-repo ongecommitte wijzigingen heeft. Dat is de bedoeling.
