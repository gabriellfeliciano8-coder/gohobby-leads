import { NextResponse, type NextRequest } from 'next/server';

// O fluxo do n8n pode levar ~15 s quando o CRM está fora (3 tentativas)
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const CAMPOS = ['nome', 'email', 'telefone', 'empresa', 'cargo'] as const;
const LIMITES: Record<(typeof CAMPOS)[number], number> = {
  nome: 120,
  email: 254,
  telefone: 30,
  empresa: 120,
  cargo: 80,
};

// Limite simples de envios por IP (proteção básica contra abuso; por instância)
const JANELA_MS = 60_000;
const MAX_POR_JANELA = 8;
const tentativas = new Map<string, number[]>();

function excedeuLimite(ip: string) {
  const agora = Date.now();
  const recentes = (tentativas.get(ip) ?? []).filter((t) => agora - t < JANELA_MS);
  recentes.push(agora);
  tentativas.set(ip, recentes);
  if (tentativas.size > 5000) tentativas.clear();
  return recentes.length > MAX_POR_JANELA;
}

function resposta(status: number, ok: boolean, mensagem: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ ok, mensagem, ...extra }, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
  // Aceita apenas chamadas vindas do próprio site
  const origem = request.headers.get('origin');
  if (origem && new URL(origem).host !== request.headers.get('host')) {
    return resposta(403, false, 'Origem não permitida.');
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'desconhecido';
  if (excedeuLimite(ip)) {
    return resposta(429, false, 'Muitas tentativas. Aguarde um minuto e tente novamente.');
  }

  const tamanho = Number(request.headers.get('content-length') ?? 0);
  if (tamanho > 10_000) return resposta(413, false, 'Envio muito grande.');

  let corpo: Record<string, unknown>;
  try {
    corpo = await request.json();
    if (!corpo || typeof corpo !== 'object' || Array.isArray(corpo)) throw new Error();
  } catch {
    return resposta(400, false, 'Formato de envio inválido.');
  }

  // Repassa somente os campos esperados (o n8n faz a validação completa)
  const payload: Record<string, string> = {};
  for (const campo of CAMPOS) {
    const valor = corpo[campo];
    payload[campo] = typeof valor === 'string' ? valor.slice(0, LIMITES[campo]) : '';
  }
  // Campo anti-robô (honeypot): repassado para o n8n registrar e bloquear
  if (typeof corpo.website === 'string' && corpo.website) payload.website = corpo.website.slice(0, 200);

  const url = process.env.N8N_WEBHOOK_URL;
  const token = process.env.N8N_WEBHOOK_TOKEN;
  if (!url || !token) {
    console.error('Variáveis N8N_WEBHOOK_URL / N8N_WEBHOOK_TOKEN não configuradas');
    return resposta(500, false, 'Serviço temporariamente indisponível. Tente novamente mais tarde.');
  }

  let r: Response;
  try {
    r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': token },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(50_000),
      cache: 'no-store',
    });
  } catch (err) {
    console.error('Falha ao chamar o n8n', err);
    return resposta(502, false, 'Não foi possível enviar agora. Tente novamente em instantes.');
  }

  const dados = (await r.json().catch(() => ({}))) as { mensagem?: string; erros?: unknown };

  switch (r.status) {
    case 200:
    case 202:
      return resposta(200, true, 'Recebemos seus dados! Nosso time comercial entrará em contato em breve.');
    case 409:
      return resposta(409, false, dados.mensagem ?? 'Já recebemos um cadastro com este e-mail.');
    case 422:
      return resposta(422, false, 'Revise os dados informados.', {
        erros: Array.isArray(dados.erros) ? dados.erros.filter((e) => typeof e === 'string') : [],
      });
    default:
      console.error('Resposta inesperada do n8n', r.status);
      return resposta(502, false, 'Não foi possível enviar agora. Tente novamente em instantes.');
  }
}
