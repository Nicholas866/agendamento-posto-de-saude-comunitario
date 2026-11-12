export const FUSO_HORARIO = "America/Sao_Paulo";

// O Brasil não tem horário de verão desde 2019. Se voltar, basta mudar
// esta constante; todo o restante do sistema usa as funções abaixo.
const OFFSET_SAO_PAULO = "-03:00";

const formatadorData = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO_HORARIO,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const formatadorHora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO_HORARIO,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const formatadorDataLonga = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO_HORARIO,
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

// en-CA produz o formato AAAA-MM-DD, que é o esperado por input[type=date].
const formatadorISO = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO_HORARIO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Data de hoje (AAAA-MM-DD) no fuso de São Paulo. */
export function hojeSP(): string {
  return formatadorISO.format(new Date());
}

/** Data (AAAA-MM-DD) de um instante ISO no fuso de São Paulo. */
export function dataSP(iso: string): string {
  return formatadorISO.format(new Date(iso));
}

/** Hora (HH:MM) de um instante ISO no fuso de São Paulo. */
export function horaSP(iso: string): string {
  return formatadorHora.format(new Date(iso));
}

/** Exibe 12/11/2026. */
export function formatarData(iso: string): string {
  return formatadorData.format(new Date(iso));
}

/** Exibe 14:30. */
export function formatarHora(iso: string): string {
  return formatadorHora.format(new Date(iso));
}

/** Exibe 12/11/2026 às 14:30. */
export function formatarDataHora(iso: string): string {
  return `${formatarData(iso)} às ${formatarHora(iso)}`;
}

/** Exibe quinta-feira, 12 de novembro de 2026. */
export function formatarDataLonga(iso: string): string {
  return formatadorDataLonga.format(new Date(iso));
}

/** Exibe 09:00 – 09:30. */
export function formatarIntervalo(inicio: string, fim: string): string {
  return `${formatarHora(inicio)} – ${formatarHora(fim)}`;
}

/** Soma dias a uma data AAAA-MM-DD, sem depender do fuso do servidor. */
export function somarDias(data: string, dias: number): string {
  const [ano, mes, dia] = data.split("-").map(Number);
  const resultado = new Date(Date.UTC(ano, mes - 1, dia + dias));
  return resultado.toISOString().slice(0, 10);
}

/** Data máxima para novos agendamentos: hoje + 30 dias. */
export function limiteSP(): string {
  return somarDias(hojeSP(), 30);
}

/** Verifica se a data existe de verdade (ex.: recusa 31/02). */
export function dataValida(data: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return false;
  }

  const [ano, mes, dia] = data.split("-").map(Number);
  const verificacao = new Date(Date.UTC(ano, mes - 1, dia));

  return (
    verificacao.getUTCFullYear() === ano &&
    verificacao.getUTCMonth() === mes - 1 &&
    verificacao.getUTCDate() === dia
  );
}

/** Verifica se a hora está no formato HH:MM. */
export function horaValida(hora: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);
}

/** Converte data + hora de São Paulo para um instante ISO (timestamptz). */
export function paraISO(data: string, hora: string): string {
  return new Date(`${data}T${hora}:00${OFFSET_SAO_PAULO}`).toISOString();
}

/** Início e fim do dia em São Paulo, já em ISO. */
export function intervaloDoDia(data: string): { inicio: string; fim: string } {
  return {
    inicio: paraISO(data, "00:00"),
    fim: paraISO(somarDias(data, 1), "00:00"),
  };
}

/** Soma minutos a um instante ISO. */
export function adicionarMinutos(iso: string, minutos: number): string {
  return new Date(new Date(iso).getTime() + minutos * 60_000).toISOString();
}

/** Data AAAA-MM-DD está entre hoje e hoje + 30 dias? */
export function dataDentroDoLimite(data: string): boolean {
  return data >= hojeSP() && data <= limiteSP();
}
