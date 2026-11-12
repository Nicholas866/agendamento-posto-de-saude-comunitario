# AGENTS.md

Projeto acadêmico "Agenda UBS": agendamento de consultas para posto de saúde comunitário. Requisitos em `README.md`; roteiro de fases em `PLANO.md`. Leia os dois antes de planejar.

## Comandos

- O Node **não está no PATH** do shell do agente. Use `C:\Program Files\nodejs\npm.cmd` (o PowerShell bloqueia `npm.ps1` por ExecutionPolicy) ou rode `$env:PATH = "C:\Program Files\nodejs;" + $env:PATH` antes.
- `npm run dev` · `npm run build` · `npm run lint` · `npm start`.
- Não há suíte de testes configurada.

## Stack e estrutura

- Next.js 16 (App Router, Turbopack, Cache Components), React 19, TypeScript, Tailwind CSS v4 via `@tailwindcss/turbopack`.
- Tailwind v4: **não existe** `tailwind.config.*`; estilos e tokens ficam em `app/globals.css` (`@theme inline`).
- Rotas em `app/`: `/` (landing), `/login` e `app/(sistema)/` com `/agenda` e `/painel` protegidas.
- Supabase: `lib/supabase/config.ts` (env + `isSupabaseConfigured`), `client.ts` (navegador) e `server.ts` (cookies). `lib/auth.ts` é a DAL (`getPerfilAtual`, `exigirPerfil`, `exigirPapel`, `rotaInicial`).
- Next 16: o antigo `middleware.ts` agora é `proxy.ts` (na raiz). Ele só renova a sessão e faz redirect otimista; a autorização real fica no layout/DAL, nas Server Actions e no RLS.
- Cache Components está ligado: página/layout que lê cookies precisa de `export const instant = false` (ou `<Suspense>`), senão o build falha.
- Fonte do sistema (sem `next/font/google`) para o build funcionar offline e manter leitura simples.
- Não instalar dependências extras sem avisar o usuário.

## Ambiente

- `.env.local` (ignorado pelo Git) recebe `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`; `.env.example` é versionado com valores vazios.
- Nunca commitar chaves. A página inicial só indica se o Supabase está configurado; não inventar credenciais.
- `supabase/schema.sql` e `supabase/seed.sql` são aplicados **manualmente** no SQL Editor do Supabase; o agente não tem como aplicá-los.
- Usuário autenticado sem linha em `perfis` é deslogado e volta a `/login?erro=sem-perfil`.
- O seed é 100% fictício e desabilita `validar_agendamento` apenas durante o script, para inserir consultas passadas (`faltou`/`realizada`).

## Convenções do produto

- Interface em **português do Brasil**, letras grandes, alto contraste — público: recepcionistas e idosos.
- Perfis: `recepcao`, `profissional`, `admin`. **Paciente não tem login**: confirma/cancela por link no e-mail.
- Regras de negócio: antecedência máxima de 30 dias; um horário nunca com dois pacientes; cancelar libera o horário para a lista de espera.
- LGPD: guardar o mínimo (sem diagnóstico/prontuário), acesso por perfil e **somente dados fictícios** em dev/testes.

## Fluxo de trabalho

- Uma fase do `PLANO.md` por vez: apresentar o plano e **esperar aprovação** antes de codar.
- Explicar brevemente cada arquivo criado; commits curtos em português, ao fim de cada fase.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
