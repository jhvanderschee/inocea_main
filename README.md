# Inocea

Hugo-theme voor de Inocea-sites (Davie Autonomous, Enigma Powercraft, SATA
Shipbuilding, …). Deze repo is zelf een gewone site met het theme in
`themes/inocea/`, net als elke klantsite; aan de repo hangt geen productiesite,
de content is filler om het theme te kunnen draaien en bekijken.

## Structuur

```
hugo.yml                  site-config: theme: inocea, params.sections
content/                  fillercontent
data/                     fillerdata
layouts/_partials/logo.html   de enige layout-override die een site mag hebben
static/img/               logo, favicon en inhoudelijke afbeeldingen
static/css/custom.css     site-overrides van de :root-tokens
static/js/custom.js       site-eigen gedrag
themes/inocea/            het theme
./sync-theme.sh           theme naar en uit een site synchroniseren
```

In het theme:

```
theme.yml                 theme-metadata
hugo.yml                  mounts: static/ telt ook als assets/ (nodig voor de svg-sprite)
layouts/                  alle templates, partials, shortcodes
static/css/               style.css, fonts.css, carousel.css, accordion.css, custom.css
static/js/                gedragsscripts + custom.js
static/fonts/             Poppins en Sometype Mono
static/img/               chrome: pijlen, menu, close, plus, markers
static/img/icons/         sprite-iconen (socials, merk-iconen)
```

## Draaien

```bash
hugo server
```

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
dezelfde paden in zijn eigen `static/` te zetten — ook deze repo doet dat. In
`custom.css` horen alleen overrides van de `:root`-tokens uit `style.css` plus
gescoopte extra's; geen kopie van het theme-stylesheet. In `custom.js` horen ook
tracking-tags zoals de LinkedIn Insight-tag: site-eigen, niet in het theme.

## Synchroniseren

Sites hebben het theme als gewone kopie in `themes/inocea/` — geen submodule,
geen subtree, zodat het CMS er niets van merkt.

```bash
./sync-theme.sh down <site-map> [--yes]   # theme -> site (dry run, dan bevestigen)
./sync-theme.sh up   <site-map> <pad>...  # losse bestanden site -> theme
./sync-theme.sh diff <site-map>           # verschillen in beide richtingen
```

Paden bij `up` zijn relatief aan het theme, dus `static/css/style.css`.

`down` weigert te draaien als deze repo ongecommitte wijzigingen heeft, en
schrijft na afloop `<site>/themes/inocea/VERSION` met de commit-hash en datum.
`up` commit niet zelf; het toont alleen `git status` en `git diff --stat`.

**Theme-code pas je nooit in een site aan zonder hem daarna met `up` terug te
halen.** Zonder die stap gooit de eerstvolgende `down` de wijziging weg.

## Skills

`.claude/skills/inocea-nieuwe-site` — een nieuwe site opzetten als kopie van deze repo.
`.claude/skills/inocea-sync` — theme-wijziging, site-eigen CSS/JS of theme bijwerken.
