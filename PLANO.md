# Plano de Desenvolvimento — Agenda UBS

## 1. Visão geral: como tudo opera

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

## 2. Telas do sistema

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

## 3. Modelo de dados (resumo)

- **perfis**: id (do login), nome, papel (`recepcao` | `profissional` | `admin`)
- **pacientes**: id, nome, cpf_ou_cartao_sus, telefone, email, canal_preferido (`email` | `whatsapp` | `sms`), criado_em
- **profissionais**: id, nome, especialidade, ativo
- **horarios**: id, profissional_id, inicio (data e hora), fim, status (`livre` | `ocupado`)
- **consultas**: id, paciente_id, horario_id, status, token_confirmacao (aleatório), criado_em, atualizado_em

Segurança: ativar RLS (Row Level Security) no Supabase, com acesso por papel.

---

## 4. Fases (passo a passo)

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


### Fase 4 — Lembretes e confirmação (≈ 3 horas)
- Rotina diária que envia e-mail 24h antes com links de confirmar e cancelar.
- Tela pública (10) que atualiza o status pelo token.
- WhatsApp/SMS fica **preparado, mas desativado**.
- **Pronto quando:** recebo um e-mail de teste e, ao clicar em cancelar, o horário é liberado.

### Fase 5 — Painel de faltas (≈ 2 horas)
- Tela 9: totais por status, taxa de faltas = faltas ÷ agendadas × 100, tabela e gráfico de barras.
- Botões "realizada" / "faltou" na agenda do dia.
- **Pronto quando:** o painel muda ao marcar uma falta.

### Fase 6 — Testes, polimento e entrega (≈ 3 horas)
- Testar o fluxo completo com dados fictícios.
- Revisar letras grandes, contraste e uso no celular.
- Atualizar o README ("Como rodar") e subir tudo no GitHub.
- Gravar prints/vídeo curto para o relatório; subir no Google Sala de Aula.
- **Pronto quando:** outra pessoa consegue clonar, rodar e fazer uma marcação seguindo o README.


---

## 5. Se o tempo apertar (ordem de corte)

1. **Manter sempre:** login, cadastros, agenda, marcar/cancelar, painel.
2. **Manter se der:** lembrete por e-mail com confirmar/cancelar.
3. **Cortar primeiro:** lista de espera, WhatsApp/SMS, remarcação avançada.

No relatório, o que ficou de fora entra como "trabalhos futuros".

## 6. Checklist de entrega

- [ ] Repositório no GitHub com README atualizado
- [ ] Projeto roda do zero seguindo o README
- [ ] Nenhuma chave ou senha no código (`.env.local` fora do Git)
- [ ] Apenas dados fictícios
- [ ] Planilha de tarefas da equipe atualizada
- [ ] Protótipo do Figma salvo (link no README)
- [ ] Entrega enviada no Google Sala de Aula
