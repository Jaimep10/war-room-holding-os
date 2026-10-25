#!/usr/bin/env bash
# Simula 7 llamadas entrantes contra el servidor (npm run dev en otra terminal).
URL="${BLINDA_URL:-http://localhost:3000}/api/v1/blinda/analyze-call"

call() {
  echo -e "\n\033[1m▶ $1\033[0m"
  curl -s -X POST "$URL" -H 'Content-Type: application/json' -d "$2" \
    | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const r=JSON.parse(s);console.log(`  ${r.decision} (${r.riskScore}/100) — ${r.reason}\n  Mami: ${r.messageForMami}`)})'
}

call "1. IESS falso (lista negra)" '{"phoneNumber":"+593991234567","transcript":"Hola le llamamos del IESS, su pensión está suspendida, necesitamos su número de cédula y clave hoy mismo"}'
call "2. Hijo detenido, número desconocido" '{"phoneNumber":"+593987654321","transcript":"Mami soy yo, estoy detenido, no le diga a nadie, deposite ya para la fianza"}'
call "3. Venta CNT a las 20h, 5 intentos" '{"phoneNumber":"+593990000201","transcript":"Le llamamos de CNT con una promoción exclusiva de fibra solo por hoy","callContext":{"hour":20,"attemptsToday":5}}'
call "4. Número privado + premio (audio Whisper mock)" '{"phoneNumber":"private","audioStream":"premio"}'
call "5. Número internacional ofreciendo premio" '{"phoneNumber":"+51912345678","transcript":"Felicidades señora, ganó un premio, solo deposite 20 dólares para el envío"}'
call "6. Farmacia conocida" '{"phoneNumber":"+593990000301","transcript":"Buenas, le llamamos de la farmacia, ya llegó su medicina"}'
call "7. Mismo IESS pero a un usuario de 35 años" '{"phoneNumber":"+593991234567","transcript":"Hola le llamamos del IESS","userProfile":{"name":"Carlos","age":35,"isVulnerable":false}}'
echo
