# Segurança

Este documento descreve as proteções aplicadas na aplicação e no fluxo de leads.

## Camadas

| Camada | Proteção |
|---|---|
| Navegador | Cabeçalhos HTTP restritivos (CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, COOP e CORP). |
| Formulário | Campo isca contra robôs e envio apenas para a rota do próprio site. |
| `/api/lead` | Checagem de origem, limite de 8 envios por minuto por IP, limite de 10 KB por envio, aceita só JSON, repassa só os cinco campos esperados com tamanho máximo e não segue redirecionamentos. |
| Webhook n8n | Token no cabeçalho `X-Api-Key`, guardado só em variável de ambiente do servidor. O fluxo valida todos os dados de novo e não confia no formulário. |
| Rotas restritas | `proxy.ts` valida a sessão no Supabase antes de abrir `/painel` e `/crm`. Cada página e cada ação confere o usuário outra vez. Respostas restritas não ficam em cache. |
| Login | Aceita apenas o usuário `gohobby`, com mensagem de erro genérica. O Supabase Auth limita as tentativas por IP. |
| Banco | Row Level Security em todas as tabelas. Visitantes anônimos não leem nada. O usuário logado só lê e, no CRM, só altera etapa, observação e responsável. |
| Consultas | Filtros do painel aceitam apenas valores de listas fixas, e a busca remove os caracteres que alteram a sintaxe da consulta. |
| IA | Só cargo e empresa são enviados ao modelo, sem dados pessoais. A resposta segue um formato fixo e, se falhar, vale a regra de pontos. |
| Dependências | Verificação com `npm run audit`. |

## Segredos

- Nenhum segredo fica no repositório. O arquivo `.env.example` traz apenas nomes e formatos.
- No navegador fica somente a chave publishable do Supabase, que depende do RLS.
- As credenciais do n8n (Supabase, Gemini, SMTP e tokens dos webhooks) ficam no cofre de credenciais do próprio n8n.

## Como reportar um problema

Abra uma issue sem incluir dados sensíveis ou entre em contato com o mantenedor do repositório.
