# AGENTS.md

Projeto acadêmico "Agenda UBS": agendamento de consultas para posto de saúde comunitário. O `README.md` é a fonte de requisitos; leia antes de planejar mudanças.

## Estado atual (importante)

- O repositório contém **apenas** `README.md` (e `.git`). Não existe `package.json`, código ou configuração.
- Não invente scripts (`npm run lint`, `npm test`, etc.) nem caminhos de arquivos: eles ainda não existem. Ao criar o scaffold, documente os comandos reais aqui.
- Branch única: `main`, sincronizada com `origin/main`. Features devem ir em branches próprias e entrar por PR.

## Stack definida

- Next.js (App Router) + TypeScript + Tailwind CSS + Supabase (banco e autenticação).
- Não instalar dependências extras sem avisar o usuário primeiro.

## Convenções do produto

- Interface em **português do Brasil**, simples, letras grandes, alto contraste — público: recepcionistas e idosos.
- Perfis de usuário: `recepcao`, `profissional` e `admin`. **Paciente não tem login**: confirma/cancela consulta por link enviado no e-mail.
- Regras de negócio obrigatórias:
  - antecedência máxima de 30 dias para agendar;
  - um horário nunca pode ter dois pacientes;
  - cancelar uma consulta libera o horário (e o horário deve poder ser reaproveitado pela lista de espera).
- LGPD: dados de saúde são sensíveis. Guardar o mínimo (sem diagnóstico/prontuário), acesso por perfil. **Usar somente dados fictícios** em desenvolvimento e testes.

## Fluxo de trabalho esperado

- Trabalhar em passos pequenos: apresentar o plano da fase e **esperar aprovação** antes de escrever código.
- Explicar brevemente cada arquivo criado.
- Commits curtos e objetivos, em português.
