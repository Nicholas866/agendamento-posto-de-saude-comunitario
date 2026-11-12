# agendamento-posto-de-saude-comunitario
# Agenda UBS — Sistema de Agendamento para Posto de Saúde Comunitário

Projeto de Extensão do curso de Ciência da Computação.

**Aluno:** Nicholas Monteiro dos Santos

Sistema web de agendamento de consultas para uma Unidade Básica de Saúde (UBS) ou posto de saúde comunitário. O objetivo é organizar a agenda, reduzir filas e diminuir as faltas dos pacientes, com lembretes automáticos por e-mail (e, futuramente, WhatsApp ou SMS).

> **Status:** em desenvolvimento (projeto acadêmico).

---

## Sumário

- [Contexto e justificativa](#contexto-e-justificativa)
- [Objetivos](#objetivos)
- [Público-alvo e local](#público-alvo-e-local)
- [Funcionalidades previstas](#funcionalidades-previstas)
- [Tecnologias e ferramentas](#tecnologias-e-ferramentas)
- [Metodologia e cronograma](#metodologia-e-cronograma)
- [Como rodar o projeto](#como-rodar-o-projeto)
- [Avaliação e resultados esperados](#avaliação-e-resultados-esperados)
- [LGPD e privacidade](#lgpd-e-privacidade)
- [Fluxo de trabalho no GitHub](#fluxo-de-trabalho-no-github)
- [Fontes consultadas](#fontes-consultadas)

---

## Contexto e justificativa

As faltas em consultas agendadas são um problema crônico da Atenção Primária no Brasil: cada horário perdido é uma vaga que outro paciente poderia ter usado.

- Em Ribeirão Preto (SP), o absenteísmo fica perto de 30%; a literatura cita para o SUS valores próximos ou acima de 25%, contra 23% de média mundial (Morais et al., 2023).
- Os números variam muito por unidade: de 11,8% a 13,5% em UBS do Espírito Santo e 48,9% em uma UBS da periferia do Rio de Janeiro (Cabezas Rio Frio, 2020).
- Em São José dos Campos, o primeiro trimestre de 2022 teve 15,77% de faltas (26.985 de 171.135 consultas).

A diferença se explica sobretudo pela **gestão da agenda e pela comunicação**: prazos de agendamento longos, retornos marcados com muita antecedência, cadastros desatualizados e agendamento sem avaliação de risco.

Já existe uma solução federal (agendamento online do PEC e-SUS APS), mas com uso muito baixo. A proposta deste projeto **não é substituir o e-SUS**, e sim criar uma ferramenta simples, desenhada com a equipe do posto, que organize a agenda local, confirme presença e avise o paciente antes da consulta.

## Objetivos

**Objetivo geral:** desenvolver e implantar, em um posto de saúde comunitário, um sistema de agendamento de consultas que reduza filas e faltas e facilite o acesso da comunidade ao atendimento.

**Objetivos específicos:**

- Levantar com a equipe do posto (recepção, enfermagem, médicos e agentes comunitários) como a agenda funciona hoje e onde ocorrem filas e faltas.
- Cadastrar pacientes e profissionais, com telefone e e-mail atualizados.
- Permitir marcar, remarcar e cancelar consultas, pelo paciente ou pela recepção.
- Enviar lembretes automáticos pelo menos 24 horas antes da consulta, com opção de confirmar ou cancelar.
- Oferecer um painel simples para a equipe ver a agenda do dia e a taxa de faltas.
- Tratar os dados de saúde conforme a LGPD, com acesso por perfil e consentimento claro.
- Capacitar a equipe do posto e entregar um manual de uso.

## Público-alvo e local

- **Público-alvo:** a comunidade atendida pelo posto, em especial pessoas que dependem do SUS para consultas de rotina (hipertensos, diabéticos, gestantes, crianças e idosos). Usuários diretos do sistema: recepção, profissionais de saúde e agentes comunitários.
- **Local:** UBS ou posto de saúde comunitário do bairro, a definir. _[Preencher: nome do posto, bairro e responsável.]_
- **Inclusão digital:** parte dos pacientes, sobretudo idosos, pode não ter smartphone. O sistema também deve funcionar pela recepção e por contato telefônico, e não só pelo celular do paciente.

## Funcionalidades previstas

Versão mínima:

1. Login com perfis: recepção, profissional de saúde e administrador.
2. Cadastro de pacientes (nome, CPF ou Cartão SUS, telefone, e-mail, canal de aviso preferido) e de profissionais.
3. Agenda por profissional, com horários liberados pela equipe.
4. Marcação, remarcação e cancelamento de consultas.
5. Lembrete automático 24 horas antes, com link para confirmar ou cancelar; o horário cancelado volta para a agenda.
6. Lista de espera: quando um horário é liberado, a recepção vê quem pode ocupá-lo.
7. Painel com a agenda do dia, consultas confirmadas e taxa de faltas por período.

Boas práticas adotadas no desenho do sistema:

- Limitar a antecedência do agendamento (por exemplo, 30 dias), pois prazos longos aumentam as faltas.
- Registrar o canal de contato preferido do paciente e atualizar os dados a cada visita.
- Registrar quem falta repetidamente e avisar o agente comunitário, em vez de apenas bloquear o paciente.
- Permitir que a recepção marque pelo paciente, para não excluir quem não usa celular.

## Tecnologias e ferramentas

| Finalidade | Ferramenta |
| --- | --- |
| Aplicação web | Next.js |
| Banco de dados e autenticação | Supabase |
| Editor com apoio de IA | Cursor |
| Editor de código | VS Code |
| Protótipos das telas | Figma |
| Controle de versão | Git e GitHub |


## Metodologia e cronograma

Desenvolvimento ágil em ciclos curtos, com entregas pequenas validadas pela equipe do posto. Duração sugerida de 8 semanas, ajustável ao calendário da disciplina.

| Etapa | Semanas | Atividades | Entrega |
| --- | --- | --- | --- |
| 1. Imersão e levantamento | 1–2 | Visita ao posto, entrevistas, mapeamento da agenda atual e da taxa de faltas | Relatório de levantamento e requisitos |
| 2. Projeto | 3 | Casos de uso, modelo de banco de dados, protótipo das telas, plano de LGPD | Protótipo validado com a equipe |
| 3. Desenvolvimento | 4–6 | Cadastros, agenda, marcação e cancelamento, lembretes, painel | Versão funcional no GitHub |
| 4. Testes e ajustes | 7 | Testes com dados fictícios, teste de usabilidade, correções | Versão corrigida |
| 5. Implantação e capacitação | 8 | Treinamento, manual, uso assistido | Sistema em uso e manual |
| 6. Avaliação e relatório final | 8 em diante | Questionário de satisfação, comparação da taxa de faltas, relatório | Relatório de extensão |

## Como rodar o projeto

> Esta seção será completada conforme o código for criado.

Pré-requisitos previstos: Node.js (versão LTS), uma conta no Supabase e Git.

```bash
# 1. Clonar o repositório
git clone https://github.com/Nicholas866/agendamento-posto-de-saude-comunitario.git
cd agendamento-posto-de-saude-comunitario

# 2. Instalar as dependências
npm install

# 3. Configurar as variáveis de ambiente
cp .env.example .env.local
# preencher com a URL e a chave do seu projeto Supabase

# 4. Rodar em modo de desenvolvimento
npm run dev
```

O sistema ficará disponível em `http://localhost:3000`.

## Avaliação e resultados esperados

- **Taxa de faltas antes e depois:** a equipe do posto informa consultas agendadas e faltas de um período anterior (idealmente 2 a 3 meses) para comparar com o período de uso. Taxa de faltas = faltas ÷ consultas agendadas × 100.
- **Uso do sistema:** consultas marcadas, confirmadas, canceladas e remarcadas, e horários cancelados que foram reaproveitados.
- **Satisfação:** questionário curto com a recepção, os profissionais e uma amostra de pacientes.
- **Relatórios dos alunos:** registro semanal do progresso e das dificuldades.

O projeto não promete um percentual de redução de faltas antes de medir a situação inicial do posto.

## LGPD e privacidade

- Dados de saúde são dados pessoais sensíveis. A base legal mais usada no atendimento é a tutela da saúde (art. 11, II, "f", da Lei nº 13.709/2018); quando o consentimento for a base, ele deve ser específico e destacado.
- **Coleta mínima:** o agendamento não guarda diagnóstico nem prontuário.
- Acesso por perfil, senhas seguras, criptografia em trânsito e registros de acesso.
- **Durante o desenvolvimento e os testes, usar apenas dados fictícios.**
- Definir um responsável por responder pedidos dos titulares e um plano para incidentes de segurança.

## Fluxo de trabalho no GitHub

- Branch principal: `main` (sempre estável).
- Novas funcionalidades em branches próprias (ex.: `feature/agenda`, `feature/lembretes`).
- Alterações entram na `main` por pull request.
- Tarefas organizadas em issues.
- Mensagens de commit curtas e objetivas, em português.

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
