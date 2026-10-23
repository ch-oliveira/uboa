#!/bin/zsh
# Renderiza cada slide do deck como PNG para revisão visual.
# Uso: ./render-slides.sh [primeiro] [ultimo]
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
DIR="${0:A:h}"
DECK="file://$DIR/../index.html"
OUT="$DIR/out"
mkdir -p "$OUT"
FIRST=${1:-1}
LAST=${2:-16}
for i in $(seq $FIRST $LAST); do
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --window-size=1920,1080 --virtual-time-budget=6000 \
    --screenshot="$OUT/slide-$(printf %02d $i).png" "$DECK#$i" >/dev/null 2>&1
done
ls "$OUT"
