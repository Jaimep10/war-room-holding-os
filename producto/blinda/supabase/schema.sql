-- BLINDA Fase 1 — esquema Supabase
-- Pegar en Supabase > SQL Editor y correr.

create extension if not exists vector; -- pgvector, reservado para huellas de estafas (Fase 2)

create table if not exists blacklisted_numbers (
  phone          text primary key,
  type           text not null check (type in ('ESTAFA', 'VENTA')),
  reports_count  integer not null default 1,
  last_report    date not null default current_date,
  scam_category  text not null
);

create table if not exists call_logs (
  id             uuid primary key default gen_random_uuid(),
  phone          text not null,
  decision       text not null check (decision in ('BLOQUEAR', 'ADVERTIR', 'PERMITIR')),
  risk_score     integer not null check (risk_score between 0 and 100),
  agents_output  jsonb not null,
  created_at     timestamptz not null default now()
);

create index if not exists call_logs_phone_idx on call_logs (phone);
create index if not exists call_logs_created_at_idx on call_logs (created_at desc);

-- 20 números de PRUEBA (ficticios). Generado desde src/db/seed.ts.
insert into blacklisted_numbers (phone, type, reports_count, last_report, scam_category) values
  ('+593991234567', 'ESTAFA', 312, '2026-10-20', 'SUPLANTACION_IESS'),
  ('+593990000101', 'ESTAFA', 188, '2026-10-22', 'SUPLANTACION_IESS'),
  ('+593990000102', 'ESTAFA', 141, '2026-10-18', 'SUPLANTACION_SRI'),
  ('+593990000103', 'ESTAFA', 97, '2026-10-15', 'SUPLANTACION_SRI'),
  ('+593990000104', 'ESTAFA', 256, '2026-10-23', 'SUPLANTACION_BANCO'),
  ('+593990000105', 'ESTAFA', 203, '2026-10-21', 'SUPLANTACION_BANCO'),
  ('+593990000106', 'ESTAFA', 420, '2026-10-24', 'FAMILIAR_DETENIDO'),
  ('+593990000107', 'ESTAFA', 377, '2026-10-24', 'FAMILIAR_DETENIDO'),
  ('+593990000108', 'ESTAFA', 165, '2026-10-19', 'FALSO_SECUESTRO'),
  ('+593990000109', 'ESTAFA', 132, '2026-10-17', 'PREMIO_FALSO'),
  ('+593990000110', 'ESTAFA', 118, '2026-10-16', 'PREMIO_FALSO'),
  ('+593990000111', 'ESTAFA', 89, '2026-10-14', 'BONO_GOBIERNO'),
  ('+593990000112', 'ESTAFA', 76, '2026-10-12', 'BONO_GOBIERNO'),
  ('+593990000113', 'ESTAFA', 64, '2026-10-11', 'SOPORTE_TECNICO_FALSO'),
  ('+593990000201', 'VENTA', 540, '2026-10-24', 'TELCO_VENTAS_CNT'),
  ('+593990000202', 'VENTA', 498, '2026-10-24', 'TELCO_VENTAS_MOVISTAR'),
  ('+593990000203', 'VENTA', 455, '2026-10-23', 'TELCO_VENTAS_CLARO'),
  ('+593990000204', 'VENTA', 310, '2026-10-22', 'BANCO_VENTA_TARJETA'),
  ('+593990000205', 'VENTA', 287, '2026-10-20', 'BANCO_VENTA_TARJETA'),
  ('+593990000206', 'VENTA', 150, '2026-10-19', 'SEGUROS_VENTA')
on conflict (phone) do update set
  type = excluded.type,
  reports_count = excluded.reports_count,
  last_report = excluded.last_report,
  scam_category = excluded.scam_category;
