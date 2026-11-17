# GoHobby · Qualificação de Leads (Parte B)

Aplicação web do case prático de Automação e IA: formulário público de captação, área restrita com login e painel de leads que reflete o resultado do fluxo n8n (Parte A). Projeto acadêmico, use apenas dados fictícios.

## Funcionalidades

| Rota | Acesso | Descrição |
|---|---|---|
| `/` | Público | Formulário com nome, e-mail, telefone, empresa e cargo. Informa se o envio deu certo ou falhou e lista os erros de validação retornados pelo fluxo. |
| `/api/lead` | Público (mesma origem) | Repassa o lead ao webhook do n8n adicionando o token no servidor. O navegador nunca vê o token. |
| `/login` | Público | Login com o usuário `gohobby`. |
| `/painel` | Restrito | Lista de leads com data e hora, dados, classificação (IA ou regra fixa), status final e motivo. Indicadores clicáveis filtram a lista; filtros por classificação e busca. |
| `/crm` | Restrito | Kanban do CRM simulado: arrastar e soltar entre etapas, atribuir responsável da equipe comercial, filtrar por responsável e atalhos de WhatsApp e e-mail. |

Formulário, fluxo e painel compartilham a mesma fonte de dados: a tabela `leads` no Supabase, gravada pelo n8n.

## Arquitetura

```
Formulário (/) → /api/lead (servidor, adiciona token) → Webhook n8n → Supabase (leads, crm_oportunidades, lista_nutricao)
                                                                         ↑
                                         Painel (/painel, /crm) ← leitura autenticada (RLS)
```

## Visual

Identidade inspirada no site da GoHobby: fundo escuro `#1D1D1F`, verde `#83B540` e lime `#BAE150`, fonte Montserrat e cantos arredondados. Botões em lime com texto escuro para manter o contraste de leitura. O ícone da aba é original (não é o logo da GoHobby).

## Segurança

- Token do webhook somente em variável de ambiente do servidor.
- Rotas restritas protegidas no `proxy.ts` e novamente em cada página (dupla checagem com `auth.getUser()`).
- Banco com Row Level Security: anônimos não leem nada; o usuário logado só lê e, no CRM, só altera a etapa.
- Login aceita apenas o usuário `gohobby`, com mensagem de erro genérica.
- Bloqueio de chamadas de outras origens, limite de envios por IP, limite de tamanho e lista fixa de campos repassados.
- Campo honeypot anti-robô e cabeçalhos HTTP de segurança (HSTS, X-Frame-Options, nosniff).
- O formulário não bloqueia dados inválidos de propósito: quem valida é o fluxo n8n, que registra o envio rejeitado no log.

## Configuração

1. Copie `.env.example` para `.env.local` e preencha:
   - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (chave publishable, nunca a secret)
   - `N8N_WEBHOOK_URL` e `N8N_WEBHOOK_TOKEN`
   - `LOGIN_EMAIL_DOMAIN` (o usuário `gohobby` é convertido em `gohobby@<dominio>` no Supabase Auth)
2. `npm install`
3. `npm run dev` e acesse http://localhost:3000

## Deploy

Publicado na Vercel. Configure as mesmas variáveis de ambiente no projeto da Vercel.

## Tecnologias

Next.js 16 (App Router), React 19, TypeScript, Supabase (Postgres + Auth), n8n e Google Gemini.
