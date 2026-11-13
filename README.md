# Agenda UBS — Sistema de Agendamento para Posto de Saúde Comunitário

Projeto de Extensão do curso de Ciência da Computação.
Aluno: Nicholas Monteiro dos Santos

Sistema web de agendamento de consultas para uma Unidade Básica de Saúde (UBS) ou posto de saúde comunitário. O objetivo é organizar a agenda, reduzir filas e dar à equipe um dado concreto sobre as faltas dos pacientes.

> **Aviso:** este é um projeto acadêmico. Todos os dados de exemplo (pacientes, CPFs, telefones e e-mails) são fictícios.

---

## Sumário

- [Contexto e justificativa](#contexto-e-justificativa)
- [Objetivos](#objetivos)
- [Público-alvo e local](#público-alvo-e-local)
- [Funcionalidades implementadas](#funcionalidades-implementadas)
- [Perfis e permissões](#perfis-e-permissões)
- [Regras de negócio](#regras-de-negócio)
- [Taxa de faltas](#taxa-de-faltas)
- [Tecnologias](#tecnologias)
- [Como rodar o projeto](#como-rodar-o-projeto)
- [Acesso para avaliação](#acesso-para-avaliação)
- [Estrutura do projeto](#estrutura-do-projeto)
- [LGPD e privacidade](#lgpd-e-privacidade)
- [Metodologia de desenvolvimento](#metodologia-de-desenvolvimento)
- [Limitações e trabalhos futuros](#limitações-e-trabalhos-futuros)
- [Fontes consultadas](#fontes-consultadas)

---

## Contexto e justificativa

As faltas em consultas agendadas são um problema crônico da Atenção Primária no Brasil: cada horário perdido é uma vaga que outro paciente poderia ter usado.

- Em Ribeirão Preto (SP), o absenteísmo fica perto de 30%; a literatura cita para o SUS valores próximos ou acima de 25%, contra 23% de média mundial (Morais et al., 2023).
- Os números variam muito por unidade: de 11,8% a 13,5% em UBS do Espírito Santo e 48,9% em uma UBS da periferia do Rio de Janeiro (Cabezas Rio Frio, 2020).
- Em São José dos Campos, o primeiro trimestre de 2022 teve 15,77% de faltas (26.985 de 171.135 consultas).

A diferença se explica sobretudo pela gestão da agenda e pela comunicação: prazos de agendamento longos, retornos marcados com muita antecedência, cadastros desatualizados e agendamento sem avaliação de risco.

Já existe uma solução federal (agendamento online do PEC e-SUS APS), mas com uso muito baixo. A proposta deste projeto não é substituir o e-SUS, e sim oferecer uma ferramenta simples, desenhada para a rotina da recepção, que organize a agenda local e registre as faltas.

## Objetivos

**Objetivo geral:** desenvolver um sistema de agendamento de consultas para um posto de saúde comunitário que reduza filas e faltas e facilite o acesso da comunidade ao atendimento.

**Objetivos específicos:**

- Cadastrar pacientes e profissionais, com telefone e e-mail.
- Permitir marcar e cancelar consultas pela recepção.
- Oferecer um painel simples para a equipe ver a agenda do dia e a taxa de faltas.
- Tratar os dados conforme a LGPD, com acesso por perfil e coleta mínima de dados.
- Contribuir para a formação em engenharia de requisitos, banco de dados, desenvolvimento web e proteção de dados.

## Público-alvo e local

- **Público-alvo:** a comunidade atendida pelo posto, em especial pessoas que dependem do SUS para consultas de rotina (hipertensos, diabéticos, gestantes, crianças e idosos). Usuários diretos do sistema: recepção, profissionais de saúde e administrador.
- Local: posto de saúde comunitário a definir.
- Inclusão digital: o paciente não precisa de smartphone nem de login. Quem opera o sistema é a recepção, que marca e cancela consultas pelo paciente, inclusive por contato telefônico. A interface usa letras grandes e alto contraste, pensando em recepcionistas e idosos.

## Funcionalidades implementadas

| Área | O que o sistema faz |
| --- | --- |
| **Login** | Entrada por e-mail e senha, com perfis (recepção, profissional e administrador) e saída segura. Quem não tem perfil cadastrado não acessa nada. |
| **Pacientes** | Cadastro, edição e busca por nome, CPF ou Cartão SUS. CPF/Cartão SUS e telefone são guardados só com dígitos e validados no tamanho. |
| **Profissionais** | Cadastro, edição e ativar/desativar (profissionais nunca são apagados, para preservar o histórico). |
| **Horários** | Liberação de vários horários de uma vez para um profissional ativo (data, intervalo e duração de 15 a 60 minutos), sem duplicar nem sobrepor, e remoção de horários livres. |
| **Nova consulta** | Escolha do paciente (com busca), do profissional ativo, do dia e de um horário livre. |
| **Agenda do dia** | Consultas do dia agrupadas por profissional, com status em **cor e texto**, e navegação entre dias. |
| **Detalhe da consulta** | Dados da consulta, cancelamento com confirmação (o horário volta a ficar livre) e marcação de **Realizada** ou **Faltou** com opção de desfazer. |
| **Painel de faltas** | Totais por status, taxa de faltas, gráficos de barras e tabelas por semana e por profissional, com filtro de período. |

## Perfis e permissões

| Ação | Recepção | Profissional | Administrador |
| --- | :---: | :---: | :---: |
| Ver agenda, pacientes e detalhe da consulta | sim | sim | sim |
| Ver CPF/Cartão SUS e telefone do paciente | sim | não | sim |
| Cadastrar e editar pacientes | sim | não | sim |
| Liberar horários e marcar/cancelar consultas | sim | não | sim |
| Marcar Realizada/Faltou e desfazer | sim | não | sim |
| Cadastrar e editar profissionais | não | não | sim |
| Ver o painel de faltas | sim | não | sim |

A autorização é feita em camadas: redirecionamento no `proxy.ts`, checagem do perfil nas páginas e em cada Server Action e, por fim, RLS (Row Level Security) no banco, que é a autoridade final.

## Regras de negócio

### No banco de dados

Impostas por gatilhos e índices, e não só na tela:

- Um horário, um paciente: índice único que ignora consultas canceladas.
- Antecedência máxima de 30 dias para agendar, e nunca no passado.
- Cancelar libera o horário automaticamente para uma nova marcação.
- Horários removidos deixam de aparecer, mas o histórico das consultas é preservado (exclusão lógica).

### Na aplicação

- Realizada/Faltou só podem ser marcadas até o dia da consulta, nunca em datas futuras.
- Profissional desativado não recebe novos horários, mas suas consultas continuam intactas.
- Datas e horas sempre exibidas no fuso de Brasília.

## Taxa de faltas

```
Taxa de faltas = faltas ÷ consultas vencidas não canceladas × 100
```

- Consultas vencidas: consultas cujo horário já passou, inclusive as que ainda constam como agendadas ou confirmadas (assim uma falta esquecida não some do indicador).
- Ficam fora da conta: consultas canceladas e consultas futuras.
- Se não houver consultas vencidas no período, o painel mostra "—" em vez de 0%.
- O painel avisa quando há consultas passadas sem registro, para a equipe atualizar a agenda.

O projeto não promete um percentual de redução de faltas. O valor de comparação é a taxa medida pelo próprio posto antes e depois do uso do sistema.

## Tecnologias

| Finalidade | Ferramenta |
| --- | --- |
| Aplicação web | Next.js 16 (App Router), React e TypeScript |
| Estilo | Tailwind CSS v4 |
| Banco de dados e autenticação | Supabase (PostgreSQL, Auth e RLS) |
| Controle de versão | Git e GitHub |
| Apoio de IA no desenvolvimento | Cursor e OpenCode |

## Como rodar o projeto

### Pré-requisitos

- [Node.js](https://nodejs.org) 20.9 ou mais novo e npm
- [Git](https://git-scm.com)
- Uma conta gratuita no [Supabase](https://supabase.com)

### 1. Baixar o código

```bash
git clone https://github.com/Nicholas866/agendamento-posto-de-saude-comunitario.git
cd agendamento-posto-de-saude-comunitario
npm install
```

### 2. Criar o banco no Supabase

1. Crie um projeto novo no Supabase.
2. Abra **SQL Editor → New query**, cole o conteúdo de `supabase/schema.sql` e clique em **Run**.
3. Faça o mesmo com `supabase/seed.sql`, que cria dados **fictícios** (5 pacientes, 2 profissionais, horários e consultas de exemplo).

> Os arquivos `supabase/fase3.sql` e `supabase/fase3b.sql` são correções para bancos criados antes dessas etapas. Em uma instalação nova, o `schema.sql` já inclui tudo.

### 3. Criar os usuários de teste

Antes de criar as contas, desative a opção **Allow new users to sign up** no Supabase Auth.

Em **Authentication → Users → Add user → Create new user**, crie três usuários com **Auto Confirm User** marcado (use e-mails fictícios e uma senha de teste):

- `admin@exemplo.com`
- `recepcao@exemplo.com`
- `profissional@exemplo.com`

Depois, no **SQL Editor**, vincule cada usuário a um perfil:

```sql
insert into public.perfis (id, nome, papel)
select id, 'Administrador Teste', 'admin' from auth.users where email = 'admin@exemplo.com'
on conflict (id) do nothing;

insert into public.perfis (id, nome, papel)
select id, 'Recepção Teste', 'recepcao' from auth.users where email = 'recepcao@exemplo.com'
on conflict (id) do nothing;

insert into public.perfis (id, nome, papel)
select id, 'Profissional Teste', 'profissional' from auth.users where email = 'profissional@exemplo.com'
on conflict (id) do nothing;
```

### 4. Configurar as variáveis de ambiente

Copie o modelo e preencha com os dados do seu projeto (**Project Settings → API**):

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=url-do-seu-projeto
NEXT_PUBLIC_SUPABASE_ANON_KEY=chave-anon-ou-publishable
```

> Use apenas a chave **anon/publishable**. Nunca coloque a chave `service_role` no projeto, e nunca envie o `.env.local` para o GitHub (ele já está no `.gitignore`). No Windows, use `copy .env.example .env.local`.

### 5. Executar

```bash
npm run dev
```

Abra `http://localhost:3000` e entre com um dos usuários criados.

### Outros comandos

```bash
npm run lint    # verifica o código
npm run build   # gera a versão de produção
npm run start   # executa a versão de produção (após o build)
```

## Acesso para avaliação

O sistema **não tem cadastro público de usuários**: as contas são criadas por quem administra o banco, como acontece em um posto real. Para avaliar o projeto existem duas formas:

1. **Usar a versão já configurada:** os dados de acesso dos usuários de demonstração (administrador, recepção e profissional) são informados junto com a entrega do trabalho, não neste repositório.
2. **Rodar do zero:** seguir a seção [Como rodar o projeto](#como-rodar-o-projeto), que cria um banco próprio com dados fictícios em poucos minutos.

Sugestão de roteiro de avaliação, entrando como **recepção**:

1. Cadastrar um paciente em Pacientes.
2. Liberar horários em Horários.
3. Marcar a consulta em Nova consulta e conferir na Agenda.
4. Cancelar uma consulta futura e ver o horário voltar a ficar livre.
5. Marcar uma consulta passada como Faltou e conferir a taxa no Painel.
6. Entrar como Profissional e verificar que ele só consulta, sem botões de alteração nem dados de contato.

## Estrutura do projeto

```
app/
  login/                 tela de login
  (sistema)/             área protegida (agenda, pacientes, profissionais,
                         horários, consultas e painel)
components/              componentes reutilizáveis (formulários, status, gráficos)
lib/                     autenticação, validação, formatação, datas e acesso a dados
  supabase/              clientes do Supabase (navegador e servidor)
supabase/
  schema.sql             tabelas, regras, gatilhos e RLS
  seed.sql               dados fictícios de exemplo
  fase3.sql, fase3b.sql  correções para bancos já existentes
proxy.ts                 renovação de sessão e redirecionamento para o login
AGENTS.md                regras e convenções do projeto
PLANO.md                 roteiro de desenvolvimento por fases
```

## LGPD e privacidade

- Dados de saúde são dados pessoais sensíveis. A base legal mais usada no atendimento é a tutela da saúde (art. 11, II, "f", da Lei nº 13.709/2018); o texto da lei deve ser conferido com o professor.
- **Coleta mínima:** o sistema não guarda diagnóstico, prontuário nem observações clínicas.
- **Acesso por perfil:** a interface do profissional não mostra CPF, telefone nem e-mail do paciente. A restrição por coluna no banco ficou como trabalho futuro; hoje o RLS limita o acesso às linhas, não às colunas.
- O painel de faltas usa apenas números e nomes de profissionais, sem dados de pacientes.
- Nenhum dado pessoal é registrado em logs.
- **Em desenvolvimento e testes, apenas dados fictícios.**
- Para uma implantação real, ainda seriam necessários: responsável pelo atendimento a pedidos dos titulares, plano de resposta a incidentes e termo de consentimento quando essa for a base legal.

## Metodologia de desenvolvimento

O projeto foi desenvolvido em fases curtas, com entrega testada manualmente ao final de cada uma:

1. **Estrutura:** projeto Next.js, Tailwind e conexão com o Supabase.
2. **Banco e login:** tabelas, regras no banco, RLS e login por perfil.
3. **Cadastros:** pacientes e profissionais.
4. **Agenda:** horários, nova consulta, agenda do dia, cancelamento e registro de presença.
5. **Painel de faltas:** totais, taxa e gráficos.

O código foi escrito com apoio de ferramentas de IA (Cursor e OpenCode) e é revisado e testado manualmente a cada fase, com commits curtos em português no GitHub.

## Limitações e trabalhos futuros

Ficaram fora desta versão:

- **Remarcar consulta** (hoje, cancela-se e agenda-se de novo).
- **Lembrete automático por e-mail, WhatsApp ou SMS** e **confirmação pelo paciente por link**. O banco já tem as funções preparadas para o link (`consulta_por_token` e `responder_consulta`), mas a página pública e o envio ainda não foram feitos.
- **Lista de espera** para horários liberados.
- **Histórico de alterações** de cada consulta.
- Vínculo entre o usuário profissional e o seu cadastro de profissional, para filtrar a agenda pessoal.
- Implantação real em um posto e medição da taxa de faltas antes e depois do uso.

## Fontes consultadas

Consultadas em 16/10/2026.

- MORAIS, R. M. et al. Gestão do absenteísmo na Atenção Primária em cidade brasileira de médio porte. _Interface (Botucatu)_, v. 27, e220197, 2023.
- CABEZAS RIO FRIO, J. F. A relação entre o modelo de acesso avançado e o absenteísmo de pacientes às consultas na rede de atenção básica do SUS na USAFA Mirim 1. TCC, Unifesp/UNASUS, 2020.
- Sistema de agendamento online aberto do PEC e-SUS APS: uma ferramenta para facilitar o acesso à Atenção Primária no Brasil. _Ciência & Saúde Coletiva_, 2021.
- MINISTÉRIO DA SAÚDE. Nota Técnica Conjunta nº 48/2026 SEIDIGI/SAPS/MS: agendamento online na APS e integração PEC e-SUS APS e Meu SUS Digital.
- PREFEITURA DE SÃO JOSÉ DOS CAMPOS. São José reduz taxa de faltas em consultas nas UBSs Resolve. 2023.
- ZENVIA. O que fazer para diminuir a falta em consultas médicas. Blog.
- CONFIDATA. LGPD para clínicas médicas: guia de adequação 2026. Blog.

---

Projeto acadêmico de extensão — Ciência da Computação.
