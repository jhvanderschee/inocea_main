#!/usr/bin/env bash
#
# Kopieert het theme themes/inocea/ (uit deze repo, inocea_main) naar losse
# sites en haalt daar losse bestanden weer uit terug. Sites hebben het theme
# als gewone kopie in themes/inocea/, geen submodule of package.
#
# Draai dit script altijd vanuit inocea_main; het staat niet in de sites.
#
#   down <site-map> [--yes]        theme naar de site kopiëren (met --delete)
#   up   <site-map> <pad-in-theme>...  losse bestanden uit de site terughalen
#   diff <site-map>                verschillen in beide richtingen tonen
#
# Voorbeelden, uitgevoerd vanuit een site:
#   ../inocea_main/sync-theme.sh down .
#   ../inocea_main/sync-theme.sh up . static/css/style.css
#
# up accepteert paden zowel met als zonder het voorvoegsel themes/inocea/.
#
# down weigert bij ongecommitte wijzigingen in deze repo en schrijft daarna
# VERSION (commit-hash + datum) in de site.
#
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
THEME_NAME="inocea"
THEME_DIR="$REPO_DIR/themes/$THEME_NAME"

usage() {
  cat >&2 <<EOF
usage: sync-theme.sh down <site-map> [--yes]
       sync-theme.sh up   <site-map> <pad-binnen-theme>...
       sync-theme.sh diff <site-map>

  down  kopieert themes/$THEME_NAME/ naar <site-map>/themes/$THEME_NAME/ (met --delete)
  up    haalt losse bestanden terug uit <site-map>/themes/$THEME_NAME/
  diff  toont de verschillen in beide richtingen
EOF
  exit 2
}

die() { echo "sync-theme: $*" >&2; exit 1; }

# VERSION is van de site zelf, .DS_Store van de Finder.
EXCLUDES=(--exclude 'VERSION' --exclude '.DS_Store')

resolve_site() {
  [ -n "${1:-}" ] || usage
  [ -d "$1" ] || die "site-map '$1' bestaat niet"
  ( cd "$1" && pwd )
}

theme_target() { echo "$1/themes/$THEME_NAME"; }

require_clean_theme() {
  if [ -n "$(git -C "$REPO_DIR" status --porcelain)" ]; then
    die "de theme-repo heeft ongecommitte wijzigingen; commit of stash ze eerst, anders is de VERSION in de site niet terug te vinden in de historie"
  fi
}

cmd_down() {
  local site yes=0
  site="$(resolve_site "${1:-}")"; shift || true
  [ "${1:-}" = "--yes" ] && yes=1

  require_clean_theme

  local target; target="$(theme_target "$site")"
  mkdir -p "$target"

  echo "theme : $THEME_DIR"
  echo "site  : $target"
  echo
  echo "--- dry run ---"
  rsync -a --delete --checksum --itemize-changes --dry-run "${EXCLUDES[@]}" "$THEME_DIR/" "$target/"
  echo "--- einde dry run ---"
  echo

  if [ "$yes" -ne 1 ]; then
    read -r -p "Doorvoeren? [y/N] " answer
    case "$answer" in y|Y|yes|YES) ;; *) echo "afgebroken"; exit 1 ;; esac
  fi

  rsync -a --delete --checksum "${EXCLUDES[@]}" "$THEME_DIR/" "$target/"

  local hash date
  hash="$(git -C "$REPO_DIR" rev-parse HEAD)"
  date="$(date '+%Y-%m-%d %H:%M:%S %z')"
  printf '%s\n%s\n' "$hash" "$date" > "$target/VERSION"

  echo "klaar; VERSION = $hash ($date)"
}

cmd_up() {
  local site; site="$(resolve_site "${1:-}")"; shift || true
  [ "$#" -gt 0 ] || usage

  local target; target="$(theme_target "$site")"
  [ -d "$target" ] || die "geen theme gevonden in $target"

  local path
  for path in "$@"; do
    path="${path#/}"
    path="${path#themes/$THEME_NAME/}"
    case "$path" in
      VERSION|.DS_Store|*/.DS_Store) die "$path hoort niet bij het theme" ;;
    esac
    [ -f "$target/$path" ] || die "$target/$path bestaat niet"
    mkdir -p "$THEME_DIR/$(dirname "$path")"
    cp "$target/$path" "$THEME_DIR/$path"
    echo "opgehaald: $path"
  done

  echo
  git -C "$REPO_DIR" status --short
  echo
  git -C "$REPO_DIR" diff --stat
}

cmd_diff() {
  local site; site="$(resolve_site "${1:-}")"
  local target; target="$(theme_target "$site")"
  [ -d "$target" ] || die "geen theme gevonden in $target"

  echo "--- in het theme, anders of ontbrekend in de site ---"
  rsync -a --delete --checksum --itemize-changes --dry-run "${EXCLUDES[@]}" "$THEME_DIR/" "$target/"
  echo
  echo "--- in de site, anders of ontbrekend in het theme ---"
  rsync -a --checksum --itemize-changes --dry-run "${EXCLUDES[@]}" "$target/" "$THEME_DIR/"
}

command -v rsync >/dev/null 2>&1 || die "rsync niet gevonden"

case "${1:-}" in
  down) shift; cmd_down "$@" ;;
  up)   shift; cmd_up   "$@" ;;
  diff) shift; cmd_diff "$@" ;;
  *)    usage ;;
esac
