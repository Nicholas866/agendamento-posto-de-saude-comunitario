type ErroBanco = {
  code?: string;
  message?: string;
};

const MENSAGENS_DE_AGENDAMENTO: Record<string, string> = {
  "Não é possível agendar em um horário que já passou.":
    "Este horário já passou. Escolha um horário futuro.",
  "O agendamento é limitado a 30 dias de antecedência.":
    "Só é possível agendar com até 30 dias de antecedência.",
  "Horário inexistente.": "Este horário não existe mais. Atualize a página.",
  "Este horário não existe mais.":
    "Este horário não existe mais. Atualize a página.",
};

function traduzirErroDeAgendamento(mensagem?: string): string | null {
  if (!mensagem) {
    return null;
  }

  for (const [textoDoBanco, textoParaTela] of Object.entries(
    MENSAGENS_DE_AGENDAMENTO,
  )) {
    if (mensagem.includes(textoDoBanco)) {
      return textoParaTela;
    }
  }

  return null;
}

/**
 * Traduz erros do Postgres/Supabase para português.
 * Não registra nem expõe valores do formulário (LGPD).
 */
export function mensagemDeErroBanco(
  erro: ErroBanco,
  mensagemDuplicado = "Este registro já existe."
): string {
  if (erro.code === "P0001") {
    return (
      traduzirErroDeAgendamento(erro.message) ??
      "Não foi possível concluir a ação. Tente novamente."
    );
  }

  switch (erro.code) {
    case "23505":
      return mensagemDuplicado;
    case "23503":
      return "Este registro está vinculado a outros dados e não pode ser alterado assim.";
    case "23514":
      return "Alguns dados não são válidos. Confira os campos e tente novamente.";
    case "42501":
      return "Seu perfil não tem permissão para esta ação.";
    case "22P02":
      return "Registro inválido.";
    default:
      return "Não foi possível salvar. Tente novamente em instantes.";
  }
}

export type ChaveErroCancelamento =
  | "sem-permissao"
  | "invalido"
  | "status"
  | "passado"
  | "salvar";

/**
 * Converte o erro P0001 de public.cancelar_consulta em uma chave de
 * mensagem já usada pela tela. Confere apenas o código e os textos fixos
 * da função; não registra dados da consulta nem do usuário.
 */
export function chaveErroCancelamento(erro: ErroBanco): ChaveErroCancelamento {
  if (erro.code !== "P0001") {
    return "salvar";
  }

  const mensagem = erro.message ?? "";

  if (mensagem.includes("perfil")) {
    return "sem-permissao";
  }

  if (mensagem.includes("encontrada")) {
    return "invalido";
  }

  if (mensagem.includes("ainda não aconteceram")) {
    return "passado";
  }

  if (mensagem.includes("não pode mais ser cancelada")) {
    return "status";
  }

  return "salvar";
}
