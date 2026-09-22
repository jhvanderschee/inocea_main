# Inocea

Hugo-theme voor de Inocea-sites (Davie Autonomous, Enigma Powercraft, SATA
Shipbuilding, …). Aan deze repo hangt geen productiesite; de inhoud van
`exampleSite/` is filler om het theme te kunnen draaien en bekijken.

## Structuur

```
theme.toml          theme-metadata
hugo.toml           mounts: static/ telt ook als assets/ (nodig voor de svg-sprite)
layouts/            alle templates, partials, shortcodes
static/css/         style.css, fonts.css, carousel.css, accordion.css, custom.css
static/js/          gedragsscripts + custom.js
static/fonts/       Poppins en Sometype Mono
static/img/         chrome: pijlen, menu, close, plus, markers
static/img/icons/   sprite-iconen (socials, merk-iconen)
bin/sync-theme.sh   theme naar en uit een site synchroniseren
exampleSite/        de voorbeeldsite
```

## Voorbeeldsite draaien

```bash
hugo server -s exampleSite
```

`exampleSite/hugo.yml` wijst met `theme: inocea_main` en `themesDir: ../..` naar
deze repo, dus de map waar je hem in uitcheckt moet `inocea_main` heten.

## Wat hoort waar

**Theme:** layouts, CSS, JS, fonts, iconen en de chrome-afbeeldingen die vanuit
CSS of layouts worden aangeroepen.

**Site:** content, `data/`, `static/uploads/`, het logo (`static/img/logo.svg`),
de favicon en alle afbeeldingen die inhoud zijn.

Een site overschrijft precies één layout: `layouts/_partials/logo.html`. Andere
layout-overrides in een site zijn niet toegestaan — wat aangepast moet worden,
wordt in het theme aangepast en met `down` uitgerold.

`static/css/custom.css` en `static/js/custom.js` zijn leeg in het theme en
bestaan alleen zodat de pagina geen 404 oplevert. Een site overschrijft ze door
dezelfde paden in zijn eigen `static/` te zetten. In `custom.css` horen alleen
overrides van de `:root`-tokens uit `style.css` plus gescoopte extra's; geen
kopie van het theme-stylesheet.

## Synchroniseren

Sites hebben het theme als gewone kopie in `themes/inocea/` — geen submodule,
geen subtree, zodat het CMS er niets van merkt.

```bash
bin/sync-theme.sh down <site-map> [--yes]   # theme -> site (dry run, dan bevestigen)
bin/sync-theme.sh up   <site-map> <pad>...  # losse bestanden site -> theme
bin/sync-theme.sh diff <site-map>           # verschillen in beide richtingen
```

`down` weigert te draaien als deze repo ongecommitte wijzigingen heeft, en
schrijft na afloop `<site>/themes/inocea/VERSION` met de commit-hash en datum.
`up` commit niet zelf; het toont alleen `git status` en `git diff --stat`.

**Theme-code pas je nooit in een site aan zonder hem daarna met `up` terug te
halen.** Zonder die stap gooit de eerstvolgende `down` de wijziging weg.

## Skills

`.claude/skills/inocea-nieuwe-site` — een nieuwe site opzetten als kopie van deze repo.
`.claude/skills/inocea-sync` — theme-wijziging, site-eigen CSS/JS of theme bijwerken.
