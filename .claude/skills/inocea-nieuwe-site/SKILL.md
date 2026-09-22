---
name: inocea-nieuwe-site
description: Een nieuwe Hugo-site opzetten op het Inocea-theme, als kopie van een bestaande Inocea-repo met themes/inocea/ erin. Triggert met "/inocea-nieuwe-site", "nieuwe site op het theme", "zet site X op", "nieuwe Inocea-site".
---

## Bepaal waar je bent

Elke Inocea-repo is een gewone Hugo-site met het theme in `themes/inocea/`. De theme-repo
zelf (`inocea_main`) is er ook één: die heeft daarnaast `bin/sync-theme.sh`, een site niet.
Andere sites staan ernaast, in dezelfde ouder-map. Sta je in een site, dan is de theme-repo
`../inocea_main` — controleer met `ls ../inocea_main/bin/sync-theme.sh`; ontbreekt die,
vraag Guus waar hij staat.

Kopieer voor een nieuwe site altijd uit `inocea_main`, niet uit een klantsite.

## Vraag wat ontbreekt

**naam** (mapnaam, kleine letters met underscores), **titel** (`site.Title`) en **url**
(`baseURL`). Niet zelf verzinnen.

## Stappen

```bash
# 1. kopie zonder historie, mét themes/inocea/, zonder wat alleen de theme-repo aangaat
rsync -a --exclude '.git' --exclude 'public' --exclude 'resources' \
      --exclude '.hugo_build.lock' --exclude '.DS_Store' \
      --exclude 'bin' --exclude 'README.md' --exclude '.claude' \
      ../inocea_main/ ../<naam>/
cd ../<naam> && git init -b main

# 2. content en uploads leegmaken
rm -rf content/* && mkdir -p static/uploads && touch static/uploads/.gitkeep
```

   En in `.gitignore` de regel `static/uploads` weghalen: in een site zijn de uploads
   inhoud en horen ze in de repo.

3. **hugo.yml**: `title` en `baseURL` invullen, `linkedin_partner_id` weghalen,
   `header_icon` uitgecommentarieerd laten. `params.sections` blijft zoals het is —
   dat is de sectie-matching, geen merkinstelling.

4. **Leegmaken tot placeholders**: elk `data/*.yml` houdt zijn keys maar krijgt één
   placeholder-item (`social_media.yml` mag helemaal leeg blijven); `static/img/logo.svg`
   en `static/img/favicon.png` vervangen; `static/css/custom.css` en `static/js/custom.js`
   leeg op de kopregel na; `content/_index.md` één header-sectie met placeholder-tekst
   (frontmatter `title: Home`, een header-afbeelding of `{{< video >}}`, dan een `h1`).

5. **Bouwen en committen**:
   ```bash
   hugo --logLevel warn          # twee bekende deprecation-warnings
   git add -A && git commit -m "Nieuwe site <naam> op het Inocea-theme"
   git remote add origin <git-url> && git push -u origin main
   ```

Merkkleuren en fonts daarna alleen in `static/css/custom.css`, als overrides van de
`:root`-tokens uit het theme. Voor het werk daarna: skill `inocea-sync`.
