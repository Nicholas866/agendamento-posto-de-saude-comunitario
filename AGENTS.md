# AGENTS.md

Projeto acadêmico "Agenda UBS": agendamento de consultas para posto de saúde comunitário. O estado real está em `README.md`; `PLANO.md` é o roteiro histórico de planejamento das fases. Leia o README antes de planejar.

## Comandos

- `npm run dev` · `npm run build` · `npm run lint` · `npm start`. Se o Node não estiver no PATH do shell, ajuste-o para a instalação local antes de rodar.
- Não há suíte de testes configurada.

## Stack e estrutura

- Next.js 16 (App Router, Turbopack, Cache Components), React 19, TypeScript, Tailwind CSS v4 via `@tailwindcss/turbopack`.
- Tailwind v4: **não existe** `tailwind.config.*`; estilos e tokens ficam em `app/globals.css` (`@theme inline`).
- Rotas em `app/`: `/` (landing) e `/login` são públicas. Todo o `app/(sistema)/` é protegido: `agenda`, `pacientes` (lista, novo e editar), `profissionais` (lista, novo e editar), `horarios`, `consultas/nova`, `consultas/[id]`, `painel` e `usuarios` (somente admin).
- Supabase: `lib/supabase/config.ts` (env + `isSupabaseConfigured`) e `server.ts` (cookies). `lib/supabase/admin.ts` é `server-only` e usa a chave de serviço para criar contas no Auth e ler `perfis` (tela Usuários). `lib/auth.ts` é a DAL (`getPerfilAtual`, `exigirPerfil`, `exigirPapel`, `rotaInicial`). O cancelamento usa `supabase.rpc("cancelar_consulta", { p_id })`.
- Next 16: o antigo `middleware.ts` agora é `proxy.ts` (na raiz). Ele só renova a sessão e faz redirect otimista; a autorização real fica no layout/DAL, nas Server Actions e no RLS.
- Cache Components está ligado: página/layout que lê cookies precisa de `export const instant = false` (ou `<Suspense>`), senão o build falha.
- Fonte do sistema (sem `next/font/google`) para o build funcionar offline e manter leitura simples.
- Não instalar dependências extras sem avisar o usuário.

## Ambiente

- `.env.local` (ignorado pelo Git) recebe `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`; `.env.example` é versionado com valores vazios.
- `SUPABASE_SERVICE_ROLE_KEY` não leva o prefixo `NEXT_PUBLIC_`, só é lida no servidor por `lib/supabase/admin.ts` e nunca deve ser importada por componente cliente, registrada em log ou commitada.
- Nunca commitar chaves. A página inicial não expõe status de infraestrutura; não inventar credenciais.
- `supabase/schema.sql` e `supabase/seed.sql` são aplicados **manualmente** no SQL Editor do Supabase; o agente não tem como aplicá-los. `supabase/fase3.sql`, `supabase/fase3b.sql` e `supabase/fase6.sql` são correções para bancos criados antes dessas etapas.
- Usuário autenticado sem linha em `perfis` é deslogado e volta a `/login?erro=sem-perfil`.
- O seed é 100% fictício e desabilita `validar_agendamento` apenas durante o script, para inserir consultas passadas (`faltou`/`realizada`).

## Convenções do produto

- Interface em **português do Brasil**, letras grandes, alto contraste — público: recepcionistas e idosos.
- Perfis: `recepcao`, `profissional`, `admin`. **Paciente não tem login**. A confirmação/cancelamento por link no e-mail ainda **não** foi implementada. Apenas o admin cria contas, pela tela Usuários (`/usuarios`); não há apagar nem rebaixar usuário nesta versão.
- O profissional pode **cancelar consultas futuras** (agendada/confirmada), mas não marcar Realizada/Faltou, desfazer, criar consultas, liberar horários nem ver CPF/telefone/e-mail. O cancelamento passa pela RPC `cancelar_consulta` (SECURITY DEFINER); a política de UPDATE de `consultas` continua restrita a recepção/admin. Como não há vínculo usuário–profissional, qualquer profissional pode cancelar a consulta de qualquer colega (limitação conhecida).
- Regras de negócio: antecedência máxima de 30 dias; um horário nunca com dois pacientes; cancelar libera o horário. A lista de espera ainda **não** foi implementada.
- CPF/Cartão SUS e telefone são gravados **somente com dígitos** (normalização em `lib/validacao.ts`); a exibição formatada fica em `lib/formatacao.ts`.
- Profissionais nunca são apagados: `ativo = false` só os remove de novos horários. Consultas existentes continuam válidas.
- Nunca logar nome, CPF, telefone ou e-mail de paciente. Erros do banco são traduzidos em `lib/erros.ts` usando apenas o código do Postgres.
- LGPD: guardar o mínimo (sem diagnóstico/prontuário), acesso por perfil e **somente dados fictícios** em dev/testes.

## Fluxo de trabalho

- Use `README.md` como estado real e `PLANO.md` como histórico de planejamento. Apresente o plano e **espere aprovação** antes de codar.
- Explicar brevemente cada arquivo criado; commits curtos em português, ao fim de cada fase.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
