type ErroBanco = {
  code?: string;
  message?: string;
};

/**
 * Traduz erros do Postgres/Supabase para português.
 * Não registra nem expõe valores do formulário (LGPD).
 */
export function mensagemDeErroBanco(
  erro: ErroBanco,
  mensagemDuplicado = "Este registro já existe."
): string {
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
