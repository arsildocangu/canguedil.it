#!/usr/bin/env sh
set -eu

PORT="${1:-4173}"
BIND="${BIND:-localhost}"
DIR="${DIR:-docs}"

if ! command -v python3 >/dev/null 2>&1; then
  echo "Error: python3 not found in PATH"
  exit 1
fi

if [ ! -d "$DIR" ]; then
  echo "Error: directory not found: $DIR"
  exit 1
fi

echo "Serving '$DIR' on http://$BIND:$PORT"
echo "Stop with Ctrl+C"
exec python3 -m http.server "$PORT" --bind "$BIND" --directory "$DIR"
