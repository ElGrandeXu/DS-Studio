#!/bin/sh
set -eu
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  # Installation utilisateur Linux facultative, sans changer le PATH global.
  for candidate in "$HOME"/.local/opt/node-v22.*-linux-x64/bin/node; do
    if [ -x "$candidate" ]; then PATH="$(dirname "$candidate"):$PATH"; export PATH; break; fi
  done
fi
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js absent du PATH. Installez Node.js LTS puis suivez README.md." >&2
  exit 1
fi
exec node scripts/launch.mjs
