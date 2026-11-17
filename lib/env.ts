import 'server-only';

// Variáveis de ambiente usadas apenas no servidor.
// A importação de 'server-only' faz o build falhar se este módulo for parar no navegador.

function obrigatoria(nome: string): string {
  const valor = process.env[nome];
  if (!valor) throw new Error(`Variável de ambiente ausente: ${nome}`);
  return valor;
}

export function configN8n() {
  return {
    url: obrigatoria('N8N_WEBHOOK_URL'),
    token: obrigatoria('N8N_WEBHOOK_TOKEN'),
  };
}

export function dominioLogin(): string {
  return process.env.LOGIN_EMAIL_DOMAIN ?? 'exemplo.com';
}
