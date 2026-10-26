#!/bin/bash
# Rend chaque SVG en PNG (échelle 2) avec Chromium, en ouvrant le SVG comme document (polices web chargées)
B=${CHROME:-chromium}
for f in "$@"; do
  w=$(grep -o 'width="[0-9.]*"' "$f" | head -1 | grep -o '[0-9.]*'); h=$(grep -o 'height="[0-9.]*"' "$f" | head -1 | grep -o '[0-9.]*')
  $B --headless --no-sandbox --disable-gpu --hide-scrollbars --force-device-scale-factor=2 --virtual-time-budget=5000 --screenshot="${f%.svg}.png" --window-size=${w%.*},${h%.*} "file://$f" >/dev/null 2>&1
  echo "$(basename "${f%.svg}.png") ${w}x${h}"
done
