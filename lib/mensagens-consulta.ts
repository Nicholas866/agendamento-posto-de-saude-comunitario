export const MENSAGEM_DATA_FUTURA =
  "Só é possível marcar presença ou falta até o dia da consulta.";

const MENSAGENS_SUCESSO: Record<string, string> = {
  criada: "Consulta agendada com sucesso.",
  cancelada: "Consulta cancelada. O horário voltou a ficar livre.",
  realizada: "Presença registrada como Realizada.",
  faltou: "Presença registrada como Faltou.",
  desfeita: "Presença desfeita. A consulta voltou para Agendada.",
};

const MENSAGENS_ERRO: Record<string, string> = {
  futuro: MENSAGEM_DATA_FUTURA,
  passado: "Só é possível cancelar consultas que ainda não aconteceram.",
  status: "Esta consulta mudou de status. Atualize a página.",
  invalido: "Consulta não encontrada.",
  salvar: "Não foi possível salvar. Tente novamente em instantes.",
  "sem-permissao": "Seu perfil não tem acesso a essa ação.",
};

export function mensagemSucessoConsulta(chave?: string): string | undefined {
  return chave ? MENSAGENS_SUCESSO[chave] : undefined;
}

export function mensagemErroConsulta(chave?: string): string | undefined {
  return chave ? MENSAGENS_ERRO[chave] : undefined;
}
