#!/bin/bash
# Pide tu ANTHROPIC_API_KEY con input oculto (no se ve al escribirla en pantalla),
# la limpia de espacios y saltos de linea, la guarda en .env.local como una sola
# linea, y levanta npm run dev. El valor de la key nunca sale de tu terminal ni
# pasa por Claude en ningun momento.
set -e
cd "$(dirname "$0")"

if [ ! -f .env.local ]; then
  if [ -f .env.local.example ]; then
    cp .env.local.example .env.local
    echo "No existia .env.local, lo cree a partir de .env.local.example."
  else
    echo "No se encontro .env.local ni .env.local.example en $(pwd). Abortando."
    exit 1
  fi
fi

read -s -p "Pega tu ANTHROPIC_API_KEY (no se mostrara en pantalla) y presiona Enter: " KEY_RAW
echo ""

# Limpieza defensiva: quita \r y \n (por si el copy/paste trae un salto de linea
# colgando) y espacios al principio/final. read -s ya recorta los espacios de los
# bordes, pero esto cubre tambien un \r suelto (comun si la key se copio desde
# algun lugar con saltos de linea estilo Windows).
KEY=$(printf '%s' "$KEY_RAW" | tr -d '\r\n' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

if [ -z "$KEY" ]; then
  echo "No se ingreso nada (o quedo vacio tras limpiar espacios/saltos de linea). Cancelado, .env.local no fue modificado."
  exit 1
fi

if printf '%s' "$KEY" | grep -q '[[:space:]]'; then
  echo "La key pegada todavia tiene un espacio en el medio -- revisa que copiaste el valor completo y nada mas. Cancelado, .env.local no fue modificado."
  exit 1
fi

tmpfile=$(mktemp)
awk -v key="$KEY" '
  BEGIN { done = 0 }
  /^ANTHROPIC_API_KEY=/ { print "ANTHROPIC_API_KEY=" key; done = 1; next }
  { print }
  END { if (!done) print "ANTHROPIC_API_KEY=" key }
' .env.local > "$tmpfile"
mv "$tmpfile" .env.local

echo "Listo: ANTHROPIC_API_KEY guardada en .env.local, en una sola linea y sin espacios ni saltos de linea."
echo ""
echo "Levantando npm run dev..."
echo ""
npm run dev
