import {
  dataSP,
  dataValida,
  hojeSP,
  inicioDaSemana,
  intervaloDoDia,
  limiteSP,
  somarDias,
} from "@/lib/datahora";
import { createClient } from "@/lib/supabase/server";
import type { StatusConsulta } from "@/lib/tipos";

const TAMANHO_PAGINA = 1_000;
const MAX_PAGINAS = 50;
const DIAS_PADRAO = 30;
const DIAS_MAXIMOS = 366;

type ProfissionalEmbutido = {
  nome: string;
};

type HorarioEmbutido = {
  inicio: string;
  profissional_id: string;
  profissionais: ProfissionalEmbutido | ProfissionalEmbutido[] | null;
};

type LinhaConsultaPainel = {
  id: string;
  status: StatusConsulta;
  horarios: HorarioEmbutido | HorarioEmbutido[] | null;
};

export type ContagemStatus = Record<StatusConsulta, number>;

type Acumulado = {
  contagens: ContagemStatus;
  vencidas: number;
  faltas: number;
};

export type ResumoSemana = {
  semanaInicio: string;
  contagens: ContagemStatus;
  vencidas: number;
  faltas: number;
  taxa: number | null;
};

export type ResumoProfissional = {
  profissionalId: string;
  profissionalNome: string;
  contagens: ContagemStatus;
  vencidas: number;
  faltas: number;
  taxa: number | null;
};

export type ResumoPainel = {
  totalConsultas: number;
  contagens: ContagemStatus;
  vencidas: number;
  faltas: number;
  taxa: number | null;
  pendencias: number;
  semanas: ResumoSemana[];
  profissionais: ResumoProfissional[];
  truncado: boolean;
  linhasLidas: number;
};

export type PeriodoPainel = {
  de: string;
  ate: string;
  aviso?: string;
};

function primeiro<T>(valor: T | T[] | null): T | null {
  if (Array.isArray(valor)) {
    return valor[0] ?? null;
  }

  return valor;
}

function contagensZeradas(): ContagemStatus {
  return {
    agendada: 0,
    confirmada: 0,
    cancelada: 0,
    faltou: 0,
    realizada: 0,
  };
}

function acumuladoVazio(): Acumulado {
  return { contagens: contagensZeradas(), vencidas: 0, faltas: 0 };
}

function somarContagem(contagens: ContagemStatus, status: StatusConsulta) {
  contagens[status] += 1;
}

function calcularTaxa(faltas: number, vencidas: number): number | null {
  if (vencidas === 0) {
    return null;
  }

  return (faltas / vencidas) * 100;
}

function diferencaEmDias(de: string, ate: string): number {
  const inicio = Date.parse(`${de}T12:00:00Z`);
  const fim = Date.parse(`${ate}T12:00:00Z`);

  return Math.round((fim - inicio) / 86_400_000) + 1;
}

/**
 * Normaliza o filtro de período do painel.
 * O padrão é hoje e os 29 dias anteriores (30 dias, incluindo hoje).
 */
export function normalizarPeriodoPainel(
  de: string | undefined,
  ate: string | undefined,
): PeriodoPainel {
  const hoje = hojeSP();
  const limite = limiteSP();
  const padrao: PeriodoPainel = {
    de: somarDias(hoje, -(DIAS_PADRAO - 1)),
    ate: hoje,
  };

  if (!de && !ate) {
    return padrao;
  }

  const deInformada = de ?? padrao.de;
  const ateInformada = ate ?? padrao.ate;

  if (!dataValida(deInformada) || !dataValida(ateInformada)) {
    return { ...padrao, aviso: "Período inválido. Mostrando os últimos 30 dias." };
  }

  if (deInformada > ateInformada) {
    return {
      ...padrao,
      aviso:
        "A data inicial precisa ser anterior à data final. Mostrando os últimos 30 dias.",
    };
  }

  let deAjustada = deInformada;
  let ateAjustada = ateInformada;
  const avisos: string[] = [];

  if (ateAjustada > limite) {
    ateAjustada = limite;
    avisos.push(
      "A data final foi ajustada para o limite de 30 dias à frente.",
    );
  }

  if (deAjustada > ateAjustada) {
    return {
      ...padrao,
      aviso:
        "A data inicial precisa ser anterior à data final. Mostrando os últimos 30 dias.",
    };
  }

  if (diferencaEmDias(deAjustada, ateAjustada) > DIAS_MAXIMOS) {
    deAjustada = somarDias(ateAjustada, -(DIAS_MAXIMOS - 1));
    avisos.push(
      `O período máximo é de ${DIAS_MAXIMOS} dias. A data inicial foi ajustada.`,
    );
  }

  return {
    de: deAjustada,
    ate: ateAjustada,
    aviso: avisos.length > 0 ? avisos.join(" ") : undefined,
  };
}

/**
 * Carrega e agrega os números do painel.
 * Não seleciona nenhum dado pessoal de paciente.
 *
 * A paginação por range evita o limite padrão de 1000 linhas do Supabase.
 * Se o limite de segurança for atingido, `truncado` fica true e a tela avisa.
 */
export async function buscarResumoPainel(
  de: string,
  ate: string,
): Promise<ResumoPainel> {
  const { inicio } = intervaloDoDia(de);
  const { fim } = intervaloDoDia(ate);
  const supabase = await createClient();

  const linhas: LinhaConsultaPainel[] = [];
  let truncado = false;
  let from = 0;

  for (let pagina = 0; pagina < MAX_PAGINAS; pagina += 1) {
    const { data, error } = await supabase
      .from("consultas")
      .select(
        "id, status, horarios!inner(inicio, profissional_id, profissionais(nome))",
      )
      .gte("horarios.inicio", inicio)
      .lt("horarios.inicio", fim)
      .order("id", { ascending: true })
      .range(from, from + TAMANHO_PAGINA - 1);

    if (error) {
      throw new Error("Não foi possível carregar o painel de faltas.");
    }

    const paginaAtual = (data ?? []) as unknown as LinhaConsultaPainel[];
    linhas.push(...paginaAtual);

    if (paginaAtual.length < TAMANHO_PAGINA) {
      break;
    }

    from += TAMANHO_PAGINA;

    if (pagina === MAX_PAGINAS - 1) {
      truncado = true;
    }
  }

  const total = contagensZeradas();
  const porSemana = new Map<string, Acumulado>();
  const porProfissional = new Map<
    string,
    Acumulado & { profissionalId: string; profissionalNome: string }
  >();

  const agora = Date.now();
  let totalConsultas = 0;
  let vencidas = 0;
  let faltas = 0;
  let pendencias = 0;

  for (const linha of linhas) {
    const horario = primeiro(linha.horarios);

    if (!horario) {
      continue;
    }

    const profissional = primeiro(horario.profissionais);
    const profissionalNome =
      profissional?.nome ?? "Profissional não encontrado";
    const inicioMs = new Date(horario.inicio).getTime();
    const semana = inicioDaSemana(dataSP(horario.inicio));

    totalConsultas += 1;
    somarContagem(total, linha.status);

    let semanaAcumulada = porSemana.get(semana);

    if (!semanaAcumulada) {
      semanaAcumulada = acumuladoVazio();
      porSemana.set(semana, semanaAcumulada);
    }

    let profissionalAcumulado = porProfissional.get(horario.profissional_id);

    if (!profissionalAcumulado) {
      profissionalAcumulado = {
        ...acumuladoVazio(),
        profissionalId: horario.profissional_id,
        profissionalNome,
      };
      porProfissional.set(horario.profissional_id, profissionalAcumulado);
    }

    somarContagem(semanaAcumulada.contagens, linha.status);
    somarContagem(profissionalAcumulado.contagens, linha.status);

    if (
      inicioMs <= agora &&
      (linha.status === "agendada" || linha.status === "confirmada")
    ) {
      pendencias += 1;
    }

    if (inicioMs <= agora && linha.status !== "cancelada") {
      vencidas += 1;
      semanaAcumulada.vencidas += 1;
      profissionalAcumulado.vencidas += 1;

      if (linha.status === "faltou") {
        faltas += 1;
        semanaAcumulada.faltas += 1;
        profissionalAcumulado.faltas += 1;
      }
    }
  }

  const semanas: ResumoSemana[] = [];
  const ultimaSemana = inicioDaSemana(ate);

  for (
    let semana = inicioDaSemana(de);
    semana <= ultimaSemana;
    semana = somarDias(semana, 7)
  ) {
    const acumulado = porSemana.get(semana) ?? acumuladoVazio();

    semanas.push({
      semanaInicio: semana,
      contagens: acumulado.contagens,
      vencidas: acumulado.vencidas,
      faltas: acumulado.faltas,
      taxa: calcularTaxa(acumulado.faltas, acumulado.vencidas),
    });
  }

  const profissionais = [...porProfissional.values()]
    .map((acumulado) => ({
      profissionalId: acumulado.profissionalId,
      profissionalNome: acumulado.profissionalNome,
      contagens: acumulado.contagens,
      vencidas: acumulado.vencidas,
      faltas: acumulado.faltas,
      taxa: calcularTaxa(acumulado.faltas, acumulado.vencidas),
    }))
    .sort((a, b) =>
      a.profissionalNome.localeCompare(b.profissionalNome, "pt-BR"),
    );

  return {
    totalConsultas,
    contagens: total,
    vencidas,
    faltas,
    taxa: calcularTaxa(faltas, vencidas),
    pendencias,
    semanas,
    profissionais,
    truncado,
    linhasLidas: linhas.length,
  };
}
