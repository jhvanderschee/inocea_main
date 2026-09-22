#!/usr/bin/env bash
set -euo pipefail

THEME_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
THEME_NAME="inocea"

usage() {
  cat >&2 <<EOF
usage: sync-theme.sh down <site-map> [--yes]
       sync-theme.sh up   <site-map> <pad-binnen-theme>...
       sync-theme.sh diff <site-map>

  down  kopieert het theme naar <site-map>/themes/$THEME_NAME/ (met --delete)
  up    haalt losse bestanden terug uit <site-map>/themes/$THEME_NAME/
  diff  toont de verschillen in beide richtingen
EOF
  exit 2
}

die() { echo "sync-theme: $*" >&2; exit 1; }

# Alles wat bij de theme-repo hoort maar niet bij het theme zelf.
EXCLUDES=(
  --exclude '.git' --exclude '.gitignore'
  --exclude '.claude'
  --exclude 'exampleSite'
  --exclude 'bin'
  --exclude 'public' --exclude 'resources' --exclude '.hugo_build.lock'
  --exclude 'README.md'
  --exclude '.DS_Store'
  --exclude 'VERSION'
)

resolve_site() {
  [ -n "${1:-}" ] || usage
  [ -d "$1" ] || die "site-map '$1' bestaat niet"
  ( cd "$1" && pwd )
}

theme_target() { echo "$1/themes/$THEME_NAME"; }

require_clean_theme() {
  if [ -n "$(git -C "$THEME_DIR" status --porcelain)" ]; then
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
  rsync -a --delete --itemize-changes --dry-run "${EXCLUDES[@]}" "$THEME_DIR/" "$target/"
  echo "--- einde dry run ---"
  echo

  if [ "$yes" -ne 1 ]; then
    read -r -p "Doorvoeren? [y/N] " answer
    case "$answer" in y|Y|yes|YES) ;; *) echo "afgebroken"; exit 1 ;; esac
  fi

  rsync -a --delete "${EXCLUDES[@]}" "$THEME_DIR/" "$target/"

  local hash date
  hash="$(git -C "$THEME_DIR" rev-parse HEAD)"
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
    [ -f "$target/$path" ] || die "$target/$path bestaat niet"
    case "$path" in
      exampleSite/*|bin/*|README.md|VERSION|.git/*) die "$path hoort niet bij het theme" ;;
    esac
    mkdir -p "$THEME_DIR/$(dirname "$path")"
    cp "$target/$path" "$THEME_DIR/$path"
    echo "opgehaald: $path"
  done

  echo
  git -C "$THEME_DIR" status --short
  echo
  git -C "$THEME_DIR" diff --stat
}

cmd_diff() {
  local site; site="$(resolve_site "${1:-}")"
  local target; target="$(theme_target "$site")"
  [ -d "$target" ] || die "geen theme gevonden in $target"

  echo "--- in het theme, anders of ontbrekend in de site ---"
  rsync -a --delete --itemize-changes --dry-run "${EXCLUDES[@]}" "$THEME_DIR/" "$target/"
  echo
  echo "--- in de site, anders of ontbrekend in het theme ---"
  rsync -a --itemize-changes --dry-run "${EXCLUDES[@]}" "$target/" "$THEME_DIR/"
}

command -v rsync >/dev/null 2>&1 || die "rsync niet gevonden"

case "${1:-}" in
  down) shift; cmd_down "$@" ;;
  up)   shift; cmd_up   "$@" ;;
  diff) shift; cmd_diff "$@" ;;
  *)    usage ;;
esac
