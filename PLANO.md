# Plano de Desenvolvimento — Agenda UBS

Guia para conduzir o OpenCode no projeto. Cole a seção "Prompt de contexto" primeiro; depois siga as fases uma de cada vez.

> **Prazo:** o PDF da disciplina indica 15/11/2026 como prazo, com 27/11 como limite máximo. Hoje é 11/11, então este plano é uma **versão enxuta (MVP)**. Confirme com a professora qual data vale.

---

## 1. Como trabalhar com o OpenCode

1. Abra o OpenCode na pasta do repositório e rode `/init` para ele gerar o `AGENTS.md` (memória do projeto). Depois edite esse arquivo e cole nele as regras da seção 2.
2. Peça **uma fase por vez**. Ao fim de cada fase: rodar o projeto, testar na tela, fazer commit.
3. Use o modo de **plano** (sem editar arquivos) para ele propor antes de codar; só depois mude para o modo de **construção**.
4. Nunca peça "faça o sistema inteiro". Tarefas pequenas dão código que você consegue ler e explicar na apresentação.
5. Commit ao fim de cada fase, com mensagem curta (ex.: `feat: tela de agenda do dia`).

## 2. Prompt de contexto (colar no início / no AGENTS.md)

```
Você vai me ajudar a construir o "Agenda UBS", um sistema web de agendamento
de consultas para um posto de saúde comunitário (projeto universitário de
Ciência da Computação). Leia o README.md do repositório.

Regras do projeto:
- Stack: Next.js (App Router) + TypeScript + Supabase (banco e login).
- Interface em português do Brasil, simples, letras grandes, bom contraste,
  pensada para recepcionistas e idosos. Usar Tailwind CSS.
- Usuários do sistema: recepção, profissional de saúde e administrador.
  O paciente NÃO precisa de login: ele confirma/cancela por um link no e-mail.
- Dados de saúde são sensíveis (LGPD): guardar o mínimo, NUNCA guardar
  diagnóstico ou prontuário, usar apenas dados fictícios nos testes.
- Regras de negócio: máximo 30 dias de antecedência; um horário não pode ter
  dois pacientes; cancelar libera o horário.
- Trabalhe em passos pequenos. Antes de codar cada fase, me mostre o plano e
  espere eu aprovar. Explique brevemente cada arquivo criado.
- Não instale dependências extras sem me avisar.

Responda apenas confirmando que entendeu e resumindo o projeto em 5 linhas.
```

---

## 3. Visão geral: como tudo opera

```
Recepção cadastra paciente  ──►  libera horários do profissional
        │                                   │
        └──────►  marca consulta  ◄─────────┘
                       │
        (24h antes) rotina diária envia e-mail ao paciente
                       │
           paciente clica em CONFIRMAR ou CANCELAR
                       │
     confirmou: status "confirmada"    cancelou: status "cancelada"
                                       e o horário volta a ficar livre
                       │
   no dia: recepção marca "realizada" ou "faltou"
                       │
        Painel mostra totais e taxa de faltas
```

**Estados da consulta:** `agendada` → `confirmada` | `cancelada` | `faltou` | `realizada`

## 4. Telas do sistema

| # | Tela | Quem usa | O que tem |
| --- | --- | --- | --- |
| 1 | Login | todos | e-mail e senha; redireciona por perfil |
| 2 | Início / Agenda do dia | recepção, profissional | consultas de hoje por profissional, status colorido, botões marcar presença / falta |
| 3 | Pacientes (lista) | recepção | busca por nome, CPF ou Cartão SUS; botão novo paciente |
| 4 | Cadastro de paciente | recepção | nome, CPF ou Cartão SUS, telefone, e-mail, canal preferido de aviso |
| 5 | Profissionais | administrador | cadastro de nome e especialidade |
| 6 | Horários | administrador, recepção | liberar horários de um profissional (data, hora, duração) |
| 7 | Nova consulta | recepção | escolher paciente, profissional e horário livre (até 30 dias) |
| 8 | Detalhe da consulta | recepção | remarcar, cancelar, ver histórico de status |
| 9 | Painel de faltas | administrador, recepção | consultas agendadas, confirmadas, canceladas, faltas, taxa % por semana e profissional (tabela + gráfico de barras) |
| 10 | Confirmar / cancelar (pública) | paciente | página aberta pelo link do e-mail, sem login |
| 11 | Lista de espera (opcional) | recepção | quem aguarda vaga; aparece quando um horário é liberado |

Desenhe as telas 2, 4, 7 e 9 no Figma antes de pedir o código (mesmo que seja um rascunho simples).

## 5. Modelo de dados (resumo)

- **perfis**: id (do login), nome, papel (`recepcao` | `profissional` | `admin`)
- **pacientes**: id, nome, cpf_ou_cartao_sus, telefone, email, canal_preferido (`email` | `whatsapp` | `sms`), criado_em
- **profissionais**: id, nome, especialidade, ativo
- **horarios**: id, profissional_id, inicio (data e hora), fim, status (`livre` | `ocupado`)
- **consultas**: id, paciente_id, horario_id, status, token_confirmacao (aleatório), criado_em, atualizado_em

Segurança: ativar RLS (Row Level Security) no Supabase, com acesso por papel.

---

## 6. Fases (passo a passo)

Cada fase termina com algo que você consegue **abrir e testar**.

### Fase 0 — Preparação (≈ 1 hora)
- Criar projeto no Supabase e pegar URL e chave pública.
- Colar o prompt de contexto no OpenCode.
- **Pronto quando:** o OpenCode resumiu o projeto corretamente.

**Prompt:**
```
Crie a estrutura inicial do projeto com Next.js, TypeScript e Tailwind.
Configure a conexão com o Supabase usando variáveis de ambiente
(.env.local, e crie um .env.example sem valores reais). Garanta que
.env.local está no .gitignore. Crie uma página inicial simples.
```

### Fase 1 — Banco de dados e login (≈ 3 horas)
- Criar as tabelas do item 5 e as regras de acesso por perfil.
- Login com e-mail e senha; página protegida por perfil.
- **Pronto quando:** consigo entrar como recepção e como admin e vejo telas diferentes.

**Prompt:**
```
Crie o script SQL para o Supabase com as tabelas: perfis, pacientes,
profissionais, horarios e consultas (campos no item 5 do PLANO.md).
Inclua RLS por papel e uma regra que impede dois pacientes no mesmo horário.
Depois implemente o login e proteja as rotas por papel. Me mostre o SQL
antes de aplicar.
```

### Fase 2 — Cadastros (≈ 3 horas)
- Telas 3, 4 e 5: pacientes e profissionais (criar, editar, buscar).
- **Pronto quando:** cadastro 5 pacientes e 2 profissionais fictícios.

**Prompt:**
```
Crie as telas de pacientes (lista com busca, cadastro e edição) e de
profissionais. Valide CPF/telefone/e-mail. Visual simples, letras grandes.
Use só dados fictícios no seed.
```

### Fase 3 — Horários e agenda (≈ 4 horas) — núcleo do sistema
- Telas 6, 7, 8 e 2: liberar horários, marcar, remarcar, cancelar, agenda do dia.
- Regras: máximo 30 dias; sem horário duplicado; cancelar libera o horário.
- **Pronto quando:** marco, remarco e cancelo uma consulta e o horário volta a ficar livre.

**Prompt:**
```
Crie as telas para a recepção ver a agenda do dia por profissional, marcar
uma consulta, remarcar e cancelar. Não permita marcar com mais de 30 dias
de antecedência nem dois pacientes no mesmo horário. Ao cancelar, o horário
volta a ficar livre. Mostre o status da consulta com cores e texto.
```

### Fase 4 — Lembretes e confirmação (≈ 3 horas)
- Rotina diária que envia e-mail 24h antes com links de confirmar e cancelar.
- Tela pública (10) que atualiza o status pelo token.
- WhatsApp/SMS fica **preparado, mas desativado**.
- **Pronto quando:** recebo um e-mail de teste e, ao clicar em cancelar, o horário é liberado.

**Prompt:**
```
Crie uma rotina diária (rota de API chamada por cron) que envia por e-mail
um lembrete 24h antes de cada consulta agendada, com nome do paciente,
profissional, data, hora e dois links: confirmar e cancelar (usando o
token_confirmacao). Crie a página pública que recebe o link e atualiza o
status. Cancelar libera o horário. Deixe WhatsApp/SMS preparado, sem ativar.
Use um serviço de e-mail simples (ex.: Resend) com a chave em variável de ambiente.
```

### Fase 5 — Painel de faltas (≈ 2 horas)
- Tela 9: totais por status, taxa de faltas = faltas ÷ agendadas × 100, tabela e gráfico de barras.
- Botões "realizada" / "faltou" na agenda do dia.
- **Pronto quando:** o painel muda ao marcar uma falta.

**Prompt:**
```
Crie a tela de painel com a quantidade de consultas agendadas, confirmadas,
canceladas e faltas por semana e por profissional, e a taxa de faltas em
porcentagem. Mostre em tabela e em gráfico de barras.
```

### Fase 6 — Testes, polimento e entrega (≈ 3 horas)
- Testar o fluxo completo com dados fictícios.
- Revisar letras grandes, contraste e uso no celular.
- Atualizar o README ("Como rodar") e subir tudo no GitHub.
- Gravar prints/vídeo curto para o relatório; subir no Google Sala de Aula.
- **Pronto quando:** outra pessoa consegue clonar, rodar e fazer uma marcação seguindo o README.

**Prompt:**
```
Revise o projeto: liste bugs, telas sem tratamento de erro e riscos de LGPD
(dados sensíveis expostos, rotas sem proteção). Corrija o que for simples e
me liste o resto. Depois atualize a seção "Como rodar" do README.
```

---

## 7. Se o tempo apertar (ordem de corte)

1. **Manter sempre:** login, cadastros, agenda, marcar/cancelar, painel.
2. **Manter se der:** lembrete por e-mail com confirmar/cancelar.
3. **Cortar primeiro:** lista de espera, WhatsApp/SMS, remarcação avançada.

No relatório, o que ficou de fora entra como "trabalhos futuros".

## 8. Checklist de entrega

- [ ] Repositório no GitHub com README atualizado
- [ ] Projeto roda do zero seguindo o README
- [ ] Nenhuma chave ou senha no código (`.env.local` fora do Git)
- [ ] Apenas dados fictícios
- [ ] Planilha de tarefas da equipe atualizada
- [ ] Protótipo do Figma salvo (link no README)
- [ ] Entrega enviada no Google Sala de Aula
