#!/bin/bash
cd "$(dirname "$0")"
echo "Levantando War Room Dashboard..."
echo ""
echo "Revisando dependencias (npm install — solo instala lo que falte, es rápido si ya estaba todo)..."
npm install --no-fund --no-audit
echo ""
echo "Cuando veas 'Ready' o 'compiled', abre http://localhost:3000 en tu navegador."
echo ""
npm run dev
