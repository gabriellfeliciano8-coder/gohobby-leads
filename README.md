# GoHobby · Qualificação de Leads

Aplicação web que recebe leads pelo site, envia cada um para o fluxo de qualificação no n8n e mostra ao time comercial o resultado de cada envio.

Produção: https://gohobby-leads.vercel.app

## Rotas

| Rota | Acesso | Descrição |
|---|---|---|
| `/` | Público | Formulário com nome, e-mail, telefone, empresa e cargo. Mostra se o envio deu certo ou falhou e lista os erros de validação devolvidos pelo fluxo. |
| `/api/lead` | Mesma origem | Repassa o lead ao webhook do n8n, adicionando o token no servidor. |
| `/login` | Público | Login com o usuário `gohobby`. |
| `/painel` | Restrito | Lista de leads com data e hora, dados, classificação, método (IA ou regra fixa), status final e motivo. Indicadores, filtros por coluna e busca. |
| `/crm` | Restrito | Kanban das oportunidades: arrastar entre etapas, atribuir responsável, filtrar por consultor e atalhos de WhatsApp e e-mail. |

## Arquitetura

```
Navegador ──► /api/lead (servidor) ──► Webhook n8n ──► Supabase
                                                         │
Navegador ◄── /painel e /crm (sessão + RLS) ◄────────────┘
```

O formulário, o fluxo e o painel usam a mesma base: a tabela `leads` no Supabase, gravada pelo n8n. O painel apenas lê o que o fluxo registrou.

## Estrutura

```
app/
  api/lead/route.ts   recebe o formulário e chama o webhook
  login/              tela e ações de login e logout
  painel/             lista de leads
  crm/                kanban e ações do CRM
components/           formulário, menu lateral e elementos visuais
lib/
  env.ts              variáveis de ambiente do servidor
  formatos.ts         rótulos, cores, datas e validação de filtros
  supabase/server.ts  cliente Supabase com a sessão do usuário
proxy.ts              proteção das rotas restritas
next.config.ts        cabeçalhos de segurança
```

## Segurança

Resumo das medidas em [SECURITY.md](SECURITY.md).

## Configuração local

1. Copie `.env.example` para `.env.local` e preencha as variáveis.
2. Instale as dependências: `npm install`
3. Rode em desenvolvimento: `npm run dev` e acesse http://localhost:3000

| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave publishable (nunca a secret) |
| `N8N_WEBHOOK_URL` | Webhook de entrada do fluxo |
| `N8N_WEBHOOK_TOKEN` | Token enviado no cabeçalho `X-Api-Key` |
| `LOGIN_EMAIL_DOMAIN` | Domínio usado para montar o e-mail do usuário `gohobby` no Supabase Auth |

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run typecheck` | Checagem de tipos |
| `npm run audit` | Verifica vulnerabilidades nas dependências de produção |

## Deploy

Hospedado na Vercel, com deploy automático a cada push na branch `main`. As variáveis de ambiente ficam configuradas no projeto da Vercel.

## Tecnologias

Next.js 16 (App Router), React 19, TypeScript, Supabase (Postgres e Auth), n8n e Google Gemini.
