#!/usr/bin/env bash
# Downloads core Swiss Ephemeris data files from the official Astrodienst repo:
# https://github.com/aloistr/swisseph/tree/master/ephe
#
# These files are required for JPL-grade calculations (SEFLG_SWIEPH).
# Covers roughly 1800–2399 CE (se*_18.se1).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EPHE_DIR="${SWEPH_EPHE_PATH:-$ROOT/ephemeris}"
BASE_URL="https://raw.githubusercontent.com/aloistr/swisseph/master/ephe"

FILES=(
  sepl_18.se1
  semo_18.se1
  seas_18.se1
)

mkdir -p "$EPHE_DIR"

echo "Downloading Swiss Ephemeris files to: $EPHE_DIR"
for file in "${FILES[@]}"; do
  dest="$EPHE_DIR/$file"
  if [[ -f "$dest" ]]; then
    echo "  skip $file (exists)"
    continue
  fi
  echo "  get  $file"
  curl -fsSL "$BASE_URL/$file" -o "$dest"
done

echo ""
echo "Done. Add to .env.local:"
echo "  SWEPH_EPHE_PATH=$EPHE_DIR"
echo "  ENABLE_SWISS_EPHEMERIS=true"
