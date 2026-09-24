/**
 * Carga dashboard/.env.local con dotenv, según se pidió explícitamente para el módulo de
 * Hostinger. Next.js ya carga .env.local solo por su cuenta en rutas de servidor -- esto es
 * una capa extra, no un reemplazo: dotenv.config() por defecto NUNCA pisa una variable que ya
 * esté en process.env, así que no genera conflicto ni duplica nada, sea cual sea el runtime.
 *
 * No forma parte de la lógica de los 22 agentes -- es un módulo nuevo, aislado, solo para el
 * cliente de Hostinger (lib/hostinger-client.ts) y quien lo importe.
 */
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
