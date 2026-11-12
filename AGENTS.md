# AGENTS.md

Projeto acadêmico "Agenda UBS": agendamento de consultas para posto de saúde comunitário. Requisitos em `README.md`; roteiro de fases em `PLANO.md`. Leia os dois antes de planejar.

## Comandos

- O Node **não está no PATH** do shell do agente. Use `C:\Program Files\nodejs\npm.cmd` (o PowerShell bloqueia `npm.ps1` por ExecutionPolicy) ou rode `$env:PATH = "C:\Program Files\nodejs;" + $env:PATH` antes.
- `npm run dev` · `npm run build` · `npm run lint` · `npm start`.
- Não há suíte de testes configurada.

## Stack e estrutura

- Next.js 16 (App Router, Turbopack, Cache Components), React 19, TypeScript, Tailwind CSS v4 via `@tailwindcss/turbopack`.
- Tailwind v4: **não existe** `tailwind.config.*`; estilos e tokens ficam em `app/globals.css` (`@theme inline`).
- Rotas em `app/`. Cliente Supabase sob demanda em `lib/supabase.ts` (`getSupabaseClient()`, `isSupabaseConfigured`) — evita quebrar o build sem credenciais.
- Fonte do sistema (sem `next/font/google`) para o build funcionar offline e manter leitura simples.
- Não instalar dependências extras sem avisar o usuário.

## Ambiente

- `.env.local` (ignorado pelo Git) recebe `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`; `.env.example` é versionado com valores vazios.
- Nunca commitar chaves. A página inicial só indica se o Supabase está configurado; não inventar credenciais.

## Convenções do produto

- Interface em **português do Brasil**, letras grandes, alto contraste — público: recepcionistas e idosos.
- Perfis: `recepcao`, `profissional`, `admin`. **Paciente não tem login**: confirma/cancela por link no e-mail.
- Regras de negócio: antecedência máxima de 30 dias; um horário nunca com dois pacientes; cancelar libera o horário para a lista de espera.
- LGPD: guardar o mínimo (sem diagnóstico/prontuário), acesso por perfil e **somente dados fictícios** em dev/testes.

## Fluxo de trabalho

- Uma fase do `PLANO.md` por vez: apresentar o plano e **esperar aprovação** antes de codar.
- Explicar brevemente cada arquivo criado; commits curtos em português, ao fim de cada fase.
