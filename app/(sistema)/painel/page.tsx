import Link from "next/link";

import { Alerta } from "@/components/alerta";
import { GraficoBarras } from "@/components/grafico-barras";
import {
  TabelaContagens,
  type LinhaTabelaContagens,
} from "@/components/tabela-contagens";
import { exigirPapel } from "@/lib/auth";
import {
  formatarData,
  hojeSP,
  limiteSP,
  paraISO,
  somarDias,
} from "@/lib/datahora";
import {
  buscarResumoPainel,
  normalizarPeriodoPainel,
  type ResumoPainel,
} from "@/lib/dados/painel";
import { formatarNumero, formatarPorcentagem } from "@/lib/formatacao";
import type { StatusConsulta } from "@/lib/tipos";

const CARDS: Array<{
  chave: StatusConsulta;
  rotulo: string;
  classe: string;
}> = [
  {
    chave: "agendada",
    rotulo: "Agendadas",
    classe: "border-sky-300 bg-sky-100 text-sky-900",
  },
  {
    chave: "confirmada",
    rotulo: "Confirmadas",
    classe: "border-green-300 bg-green-100 text-green-900",
  },
  {
    chave: "cancelada",
    rotulo: "Canceladas",
    classe: "border-gray-400 bg-gray-200 text-gray-800",
  },
  {
    chave: "faltou",
    rotulo: "Faltas",
    classe: "border-red-300 bg-red-100 text-red-900",
  },
  {
    chave: "realizada",
    rotulo: "Realizadas",
    classe: "border-emerald-300 bg-emerald-100 text-emerald-900",
  },
];

function formatarDataCurta(data: string): string {
  return formatarData(paraISO(data, "12:00"));
}

function linhasPorSemana(resumo: ResumoPainel): LinhaTabelaContagens[] {
  return resumo.semanas.map((semana) => ({
    chave: semana.semanaInicio,
    rotulo: `Semana de ${formatarDataCurta(semana.semanaInicio)}`,
    contagens: semana.contagens,
    vencidas: semana.vencidas,
    faltas: semana.faltas,
    taxa: semana.taxa,
  }));
}

function linhasPorProfissional(resumo: ResumoPainel): LinhaTabelaContagens[] {
  return resumo.profissionais.map((profissional) => ({
    chave: profissional.profissionalId,
    rotulo: profissional.profissionalNome,
    contagens: profissional.contagens,
    vencidas: profissional.vencidas,
    faltas: profissional.faltas,
    taxa: profissional.taxa,
  }));
}

function textoDePendencia(quantidade: number): string {
  if (quantidade === 1) {
    return "1 consulta já passou e está sem registro (realizada ou falta).";
  }

  return `${formatarNumero(
    quantidade,
  )} consultas já passaram e estão sem registro (realizada ou falta).`;
}

export default async function PainelPage({
  searchParams,
}: {
  searchParams: Promise<{ de?: string; ate?: string }>;
}) {
  const perfil = await exigirPapel("recepcao", "admin");
  const parametros = await searchParams;
  const periodo = normalizarPeriodoPainel(parametros.de, parametros.ate);
  const hoje = hojeSP();
  const limite = limiteSP();

  let resumo: ResumoPainel | null = null;
  let erro = "";

  try {
    resumo = await buscarResumoPainel(periodo.de, periodo.ate);
  } catch {
    erro =
      "Não foi possível carregar os números do painel. Tente novamente em instantes.";
  }

  const voltarAoPadrao = periodo.de !== somarDias(hoje, -29) || periodo.ate !== hoje;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Painel de faltas</h1>
        <p className="mt-2 text-xl text-gray-700">
          Olá, {perfil.nome}. Acompanhe as consultas de{" "}
          {formatarDataCurta(periodo.de)} a {formatarDataCurta(periodo.ate)}.
        </p>
      </div>

      {periodo.aviso ? <Alerta tipo="aviso">{periodo.aviso}</Alerta> : null}
      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}

      <section className="rounded-2xl border-2 border-gray-200 bg-white p-6">
        <form
          method="get"
          action="/painel"
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label
              htmlFor="de"
              className="block text-lg font-semibold text-gray-900"
            >
              Data inicial
            </label>
            <input
              id="de"
              name="de"
              type="date"
              max={limite}
              defaultValue={periodo.de}
              className="mt-2 w-full rounded-xl border-2 border-gray-400 bg-white px-4 py-3 text-xl text-gray-900 focus:border-sky-800"
            />
          </div>

          <div className="flex-1">
            <label
              htmlFor="ate"
              className="block text-lg font-semibold text-gray-900"
            >
              Data final
            </label>
            <input
              id="ate"
              name="ate"
              type="date"
              max={limite}
              defaultValue={periodo.ate}
              className="mt-2 w-full rounded-xl border-2 border-gray-400 bg-white px-4 py-3 text-xl text-gray-900 focus:border-sky-800"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-sky-900 px-6 py-3 text-xl font-bold text-white hover:bg-sky-800"
          >
            Ver período
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="text-base text-gray-600">
            O período máximo é de 366 dias. A data final pode ir até 30 dias à
            frente.
          </p>
          {voltarAoPadrao ? (
            <Link
              href="/painel"
              className="rounded-xl border-2 border-sky-900 px-4 py-2 text-lg font-semibold text-sky-900 hover:bg-sky-50"
            >
              Voltar aos últimos 30 dias
            </Link>
          ) : null}
        </div>
      </section>

      {resumo && resumo.truncado ? (
        <Alerta tipo="aviso">
          Os números podem estar incompletos: o limite de segurança de{" "}
          {formatarNumero(resumo.linhasLidas)} consultas foi atingido.
          Reduza o período para ver o total completo.
        </Alerta>
      ) : null}

      {resumo && resumo.pendencias > 0 ? (
        <Alerta tipo="aviso">
          {textoDePendencia(resumo.pendencias)}{" "}
          <Link
            href={`/agenda?data=${hoje}`}
            className="underline decoration-2 underline-offset-2"
          >
            Atualize na agenda
          </Link>
          .
        </Alerta>
      ) : null}

      {!resumo && !erro ? null : resumo && resumo.totalConsultas === 0 ? (
        <section className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Nenhuma consulta encontrada
          </h2>
          <p className="mt-3 text-lg text-gray-700">
            Não há consultas entre {formatarDataCurta(periodo.de)} e{" "}
            {formatarDataCurta(periodo.ate)}. Ajuste o período acima ou volte
            para a agenda para marcar presenças.
          </p>
          <Link
            href={`/agenda?data=${hoje}`}
            className="mt-5 inline-block rounded-xl bg-sky-900 px-6 py-3 text-xl font-bold text-white hover:bg-sky-800"
          >
            Ir para a agenda de hoje
          </Link>
        </section>
      ) : resumo ? (
        <>
          <section aria-labelledby="titulo-totais">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="titulo-totais" className="text-2xl font-bold text-gray-900">
                Totais por status
              </h2>
              <p className="text-lg text-gray-700">
                {formatarNumero(resumo.totalConsultas)}{" "}
                {resumo.totalConsultas === 1 ? "consulta" : "consultas"} no
                período
              </p>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {CARDS.map((card) => (
                <div
                  key={card.chave}
                  className={`rounded-2xl border-2 p-4 ${card.classe}`}
                >
                  <dt className="text-base font-bold">{card.rotulo}</dt>
                  <dd className="mt-1 text-4xl font-bold tabular-nums">
                    {formatarNumero(resumo.contagens[card.chave])}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section
            aria-labelledby="titulo-taxa"
            className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <h2
                  id="titulo-taxa"
                  className="text-2xl font-bold text-sky-950"
                >
                  Taxa de faltas no período
                </h2>
                <p className="mt-1 text-lg text-sky-900">
                  {formatarNumero(resumo.faltas)}{" "}
                  {resumo.faltas === 1 ? "falta" : "faltas"} em{" "}
                  {formatarNumero(resumo.vencidas)}{" "}
                  {resumo.vencidas === 1
                    ? "consulta vencida não cancelada"
                    : "consultas vencidas não canceladas"}
                </p>
              </div>
              <p className="text-5xl font-bold tabular-nums text-sky-950 sm:text-6xl">
                {formatarPorcentagem(resumo.taxa)}
              </p>
            </div>

            <div className="mt-5 rounded-xl border-2 border-sky-300 bg-white p-4 sm:p-5">
              <p className="text-lg font-bold text-gray-900">
                Taxa de faltas = faltas ÷ consultas vencidas não canceladas ×
                100
              </p>
              {resumo.vencidas === 0 ? (
                <p className="mt-2 text-lg text-gray-800">
                  Ainda não há consultas vencidas não canceladas no período,
                  então a taxa fica sem valor (—).
                </p>
              ) : (
                <p className="mt-2 text-lg text-gray-800">
                  {formatarNumero(resumo.faltas)}{" "}
                  {resumo.faltas === 1 ? "falta" : "faltas"} ÷{" "}
                  {formatarNumero(resumo.vencidas)} consultas vencidas não
                  canceladas × 100 ={" "}
                  <strong className="font-bold text-gray-900">
                    {formatarPorcentagem(resumo.taxa)}
                  </strong>
                </p>
              )}
            </div>

            <p className="mt-4 text-base text-sky-900">
              Entram na conta as consultas com horário já passado, inclusive as
              que continuam como agendadas ou confirmadas. Canceladas e
              consultas futuras ficam de fora.
            </p>
          </section>

          <div className="space-y-6">
            <GraficoBarras
              titulo="Taxa de faltas por semana"
              descricao="Cada barra mostra a taxa da semana. O texto ao lado traz faltas, consultas vencidas e porcentagem."
              itens={resumo.semanas.map((semana) => ({
                rotulo: `Semana de ${formatarDataCurta(semana.semanaInicio)}`,
                faltas: semana.faltas,
                vencidas: semana.vencidas,
                taxa: semana.taxa,
              }))}
            />

            <GraficoBarras
              titulo="Taxa de faltas por profissional"
              descricao="Somente profissionais com consultas no período aparecem aqui."
              itens={resumo.profissionais.map((profissional) => ({
                rotulo: profissional.profissionalNome,
                faltas: profissional.faltas,
                vencidas: profissional.vencidas,
                taxa: profissional.taxa,
              }))}
            />
          </div>

          <TabelaContagens
            titulo="Contagens por semana"
            rotuloColuna="Semana"
            linhas={linhasPorSemana(resumo)}
          />

          <TabelaContagens
            titulo="Contagens por profissional"
            rotuloColuna="Profissional"
            linhas={linhasPorProfissional(resumo)}
          />
        </>
      ) : null}
    </div>
  );
}
