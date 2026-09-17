#!/bin/bash
# Pide tu ANTHROPIC_API_KEY con input oculto (no se ve al escribirla en pantalla),
# la guarda en .env.local, y levanta npm run dev. El valor de la key nunca sale
# de tu terminal ni pasa por Claude en ningun momento.
set -e
cd "$(dirname "$0")"

if [ ! -f .env.local ]; then
  echo "No se encontro .env.local en $(pwd). Abortando."
  exit 1
fi

read -s -p "Pega tu ANTHROPIC_API_KEY (no se mostrara en pantalla) y presiona Enter: " KEY
echo ""

if [ -z "$KEY" ]; then
  echo "No se ingreso nada. Cancelado, .env.local no fue modificado."
  exit 1
fi

tmpfile=$(mktemp)
awk -v key="$KEY" '{
  if ($0 ~ /^ANTHROPIC_API_KEY=/) print "ANTHROPIC_API_KEY=" key
  else print $0
}' .env.local > "$tmpfile"
mv "$tmpfile" .env.local

echo "Listo: ANTHROPIC_API_KEY guardada en .env.local."
echo ""
echo "Levantando npm run dev..."
echo ""
npm run dev
