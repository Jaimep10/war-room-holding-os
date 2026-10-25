import pc from 'picocolors';

const tags = {
  ORCHESTRATOR: pc.bgMagenta(pc.white(pc.bold(' ORCHESTRATOR '))),
  CallScout: pc.cyan(pc.bold('[CallScout]')),
  ScamHunter: pc.yellow(pc.bold('[ScamHunter]')),
  VulnProtector: pc.green(pc.bold('[VulnProtector]')),
  DB: pc.gray('[DB]'),
  WhatsApp: pc.blue(pc.bold('[WhatsApp]')),
} as const;

export type LogTag = keyof typeof tags;

export function log(tag: LogTag, message: string) {
  console.log(`${tags[tag]} ${pc.dim('->')} ${message}`);
}

export function decisionColor(decision: string, text: string) {
  if (decision === 'BLOQUEAR') return pc.bgRed(pc.white(pc.bold(` ${text} `)));
  if (decision === 'ADVERTIR') return pc.bgYellow(pc.black(pc.bold(` ${text} `)));
  return pc.bgGreen(pc.black(pc.bold(` ${text} `)));
}

export function divider() {
  console.log(pc.dim('─'.repeat(70)));
}
