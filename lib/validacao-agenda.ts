import {
  dataDentroDoLimite,
  dataValida,
  hojeSP,
  horaValida,
  paraISO,
} from "./datahora";
import { UUID_REGEX } from "./tipos";

export const DURACOES_PERMITIDAS = [15, 20, 30, 45, 60] as const;

export type IntervaloHorario = {
  inicio: string;
  fim: string;
};

export type DadosLiberacaoHorarios = {
  profissional_id: string;
  data: string;
  duracao: number;
  slots: IntervaloHorario[];
};

export type DadosNovaConsulta = {
  paciente_id: string;
  horario_id: string;
};

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor : "";
}

/** Data de filtro: usa hoje quando o valor é inválido ou está fora do limite. */
export function normalizarDataFiltro(
  valor: string | undefined,
  apenasFuturo = false,
): string {
  const data = texto(valor);

  if (!dataValida(data)) {
    return hojeSP();
  }

  if (apenasFuturo && !dataDentroDoLimite(data)) {
    return hojeSP();
  }

  return data;
}

export function validarLiberacaoHorarios(valores: Record<string, string>): {
  erros: Record<string, string>;
  dados: DadosLiberacaoHorarios | null;
} {
  const erros: Record<string, string> = {};

  const profissionalId = texto(valores.profissional_id);
  const data = texto(valores.data);
  const horaInicial = texto(valores.hora_inicial);
  const horaFinal = texto(valores.hora_final);
  const duracao = Number(texto(valores.duracao));

  if (!UUID_REGEX.test(profissionalId)) {
    erros.profissional_id = "Escolha um profissional ativo.";
  }

  if (!dataValida(data)) {
    erros.data = "Escolha uma data válida.";
  } else if (!dataDentroDoLimite(data)) {
    erros.data = "Escolha uma data entre hoje e 30 dias à frente.";
  }

  if (!horaValida(horaInicial)) {
    erros.hora_inicial = "Informe a hora inicial no formato HH:MM.";
  }

  if (!horaValida(horaFinal)) {
    erros.hora_final = "Informe a hora final no formato HH:MM.";
  }

  if (!DURACOES_PERMITIDAS.includes(duracao as (typeof DURACOES_PERMITIDAS)[number])) {
    erros.duracao = "Escolha uma duração válida.";
  }

  if (Object.keys(erros).length > 0) {
    return { erros, dados: null };
  }

  const inicioMs = new Date(paraISO(data, horaInicial)).getTime();
  const fimMs = new Date(paraISO(data, horaFinal)).getTime();

  if (inicioMs >= fimMs) {
    return {
      erros: { hora_final: "A hora final precisa ser depois da hora inicial." },
      dados: null,
    };
  }

  const duracaoMs = duracao * 60_000;
  const slots: IntervaloHorario[] = [];
  let atual = inicioMs;

  while (atual + duracaoMs <= fimMs) {
    slots.push({
      inicio: new Date(atual).toISOString(),
      fim: new Date(atual + duracaoMs).toISOString(),
    });
    atual += duracaoMs;
  }

  if (slots.length === 0) {
    return {
      erros: {
        hora_final:
          "O intervalo é menor que a duração escolhida. Aumente o intervalo ou reduza a duração.",
      },
      dados: null,
    };
  }

  const agora = Date.now();
  const limite = agora + 30 * 24 * 60 * 60 * 1000;

  if (new Date(slots[0].inicio).getTime() <= agora) {
    return {
      erros: {
        hora_inicial:
          "O horário inicial já passou. Escolha um horário futuro.",
      },
      dados: null,
    };
  }

  if (new Date(slots[slots.length - 1].inicio).getTime() > limite) {
    return {
      erros: {
        hora_final:
          "O intervalo ultrapassa o limite de 30 dias. Reduza a data ou o horário final.",
      },
      dados: null,
    };
  }

  return {
    erros: {},
    dados: {
      profissional_id: profissionalId,
      data,
      duracao,
      slots,
    },
  };
}

export function validarNovaConsulta(valores: Record<string, string>): {
  erros: Record<string, string>;
  dados: DadosNovaConsulta | null;
} {
  const erros: Record<string, string> = {};

  const pacienteId = texto(valores.paciente_id);
  const horarioId = texto(valores.horario_id);

  if (!UUID_REGEX.test(pacienteId)) {
    erros.paciente_id = "Escolha um paciente da lista.";
  }

  if (!UUID_REGEX.test(horarioId)) {
    erros.horario_id = "Escolha um horário livre da lista.";
  }

  if (Object.keys(erros).length > 0) {
    return { erros, dados: null };
  }

  return {
    erros: {},
    dados: { paciente_id: pacienteId, horario_id: horarioId },
  };
}
