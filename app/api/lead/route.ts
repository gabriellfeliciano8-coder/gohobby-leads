import { NextResponse, type NextRequest } from 'next/server';
import { configN8n } from '@/lib/env';

// Com o CRM fora do ar o fluxo faz 3 tentativas e pode levar cerca de 15 s
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
const TAMANHO_MAXIMO = 10_000;

// Limite de envios por IP. Fica em memória, então vale por instância do servidor.
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

// Aceita apenas chamadas feitas pelo próprio site
function mesmaOrigem(request: NextRequest) {
  const host = request.headers.get('host');
  const origem = request.headers.get('origin');
  if (origem) {
    try {
      return new URL(origem).host === host;
    } catch {
      return false;
    }
  }
  // Sem Origin, aceita somente se o navegador informar que a chamada é do mesmo site
  return request.headers.get('sec-fetch-site') === 'same-origin';
}

function ipDoCliente(request: NextRequest) {
  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'desconhecido'
  );
}

export async function POST(request: NextRequest) {
  if (!mesmaOrigem(request)) return resposta(403, false, 'Origem não permitida.');

  if (!request.headers.get('content-type')?.includes('application/json')) {
    return resposta(415, false, 'Formato de envio inválido.');
  }

  if (excedeuLimite(ipDoCliente(request))) {
    return resposta(429, false, 'Muitas tentativas. Aguarde um minuto e tente novamente.');
  }

  // Lê o corpo como texto para limitar o tamanho mesmo sem o cabeçalho Content-Length
  const texto = await request.text();
  if (texto.length > TAMANHO_MAXIMO) return resposta(413, false, 'Envio muito grande.');

  let corpo: Record<string, unknown>;
  try {
    corpo = JSON.parse(texto);
    if (!corpo || typeof corpo !== 'object' || Array.isArray(corpo)) throw new Error();
  } catch {
    return resposta(400, false, 'Formato de envio inválido.');
  }

  // Repassa somente os campos esperados. A validação completa é feita no n8n.
  const payload: Record<string, string> = {};
  for (const campo of CAMPOS) {
    const valor = corpo[campo];
    payload[campo] = typeof valor === 'string' ? valor.slice(0, LIMITES[campo]) : '';
  }
  // Campo anti-robô (honeypot): repassado para o n8n registrar e bloquear
  if (typeof corpo.website === 'string' && corpo.website) payload.website = corpo.website.slice(0, 200);

  let n8n: { url: string; token: string };
  try {
    n8n = configN8n();
  } catch (err) {
    console.error((err as Error).message);
    return resposta(500, false, 'Serviço temporariamente indisponível. Tente novamente mais tarde.');
  }

  let r: Response;
  try {
    r = await fetch(n8n.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': n8n.token },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(50_000),
      cache: 'no-store',
      redirect: 'error',
    });
  } catch {
    console.error('Falha ao chamar o webhook de leads');
    return resposta(502, false, 'Não foi possível enviar agora. Tente novamente em instantes.');
  }

  const dados = (await r.json().catch(() => ({}))) as { mensagem?: unknown; erros?: unknown };

  switch (r.status) {
    case 200:
    case 202:
      return resposta(200, true, 'Recebemos seus dados! Nosso time comercial entrará em contato em breve.');
    case 409:
      return resposta(
        409,
        false,
        typeof dados.mensagem === 'string' ? dados.mensagem.slice(0, 200) : 'Já recebemos um cadastro com este e-mail.',
      );
    case 422:
      return resposta(422, false, 'Revise os dados informados.', {
        erros: Array.isArray(dados.erros)
          ? dados.erros.filter((e): e is string => typeof e === 'string').slice(0, 10).map((e) => e.slice(0, 120))
          : [],
      });
    default:
      console.error('Resposta inesperada do webhook de leads', r.status);
      return resposta(502, false, 'Não foi possível enviar agora. Tente novamente em instantes.');
  }
}
