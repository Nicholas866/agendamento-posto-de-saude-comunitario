import Link from "next/link";

import { Alerta } from "@/components/alerta";
import { StatusConsultaBadge } from "@/components/status-consulta";
import { exigirPerfil } from "@/lib/auth";
import {
  formatarDataLonga,
  formatarHora,
  hojeSP,
  paraISO,
  somarDias,
} from "@/lib/datahora";
import { listarConsultasDoDia } from "@/lib/dados/consultas";
import {
  mensagemErroConsulta,
  mensagemSucessoConsulta,
} from "@/lib/mensagens-consulta";
import type { ConsultaAgenda } from "@/lib/tipos";
import { normalizarDataFiltro } from "@/lib/validacao-agenda";

import { AcoesConsulta } from "../consultas/acoes-consulta";

type GrupoProfissional = {
  profissional_id: string;
  profissional_nome: string;
  especialidade: string;
  consultas: ConsultaAgenda[];
};

function agruparPorProfissional(
  consultas: ConsultaAgenda[],
): GrupoProfissional[] {
  const grupos = new Map<string, GrupoProfissional>();

  for (const consulta of consultas) {
    const grupo = grupos.get(consulta.profissional_id);

    if (grupo) {
      grupo.consultas.push(consulta);
      continue;
    }

    grupos.set(consulta.profissional_id, {
      profissional_id: consulta.profissional_id,
      profissional_nome: consulta.profissional_nome,
      especialidade: consulta.especialidade,
      consultas: [consulta],
    });
  }

  return [...grupos.values()].sort((a, b) =>
    a.profissional_nome.localeCompare(b.profissional_nome, "pt-BR"),
  );
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; sucesso?: string; erro?: string }>;
}) {
  const perfil = await exigirPerfil();
  const parametros = await searchParams;

  const data = normalizarDataFiltro(
    typeof parametros.data === "string" ? parametros.data : undefined,
  );

  const consultas = await listarConsultasDoDia(data);
  const grupos = agruparPorProfissional(consultas);

  const ativas = consultas.filter(
    (consulta) =>
      consulta.status === "agendada" || consulta.status === "confirmada",
  ).length;
  const concluidas = consultas.filter(
    (consulta) =>
      consulta.status === "realizada" || consulta.status === "faltou",
  ).length;
  const canceladas = consultas.filter(
    (consulta) => consulta.status === "cancelada",
  ).length;

  const hoje = hojeSP();
  const anterior = somarDias(data, -1);
  const proximo = somarDias(data, 1);
  const podeMarcar = perfil.papel === "recepcao" || perfil.papel === "admin";

  const mensagemSucesso = mensagemSucessoConsulta(parametros.sucesso);
  const mensagemErro = mensagemErroConsulta(parametros.erro);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Agenda do dia</h1>
          <p className="mt-2 text-xl text-gray-700">
            {formatarDataLonga(paraISO(data, "12:00"))}
          </p>
        </div>

        {podeMarcar ? (
          <Link
            href={`/consultas/nova?data=${data}`}
            className="rounded-xl bg-sky-900 px-6 py-4 text-xl font-bold text-white hover:bg-sky-800"
          >
            Nova consulta
          </Link>
        ) : null}
      </div>

      {mensagemSucesso ? (
        <Alerta tipo="sucesso">{mensagemSucesso}</Alerta>
      ) : null}
      {mensagemErro ? <Alerta tipo="erro">{mensagemErro}</Alerta> : null}

      <section className="rounded-2xl border-2 border-gray-200 bg-white p-6">
        <form
          method="get"
          action="/agenda"
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label
              htmlFor="data"
              className="block text-lg font-semibold text-gray-900"
            >
              Ver outro dia
            </label>
            <input
              id="data"
              name="data"
              type="date"
              defaultValue={data}
              className="mt-2 w-full rounded-xl border-2 border-gray-400 bg-white px-4 py-3 text-xl text-gray-900 focus:border-sky-800"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-sky-900 px-6 py-3 text-xl font-bold text-white hover:bg-sky-800"
          >
            Ver dia
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/agenda?data=${anterior}`}
            className="rounded-xl border-2 border-gray-400 px-4 py-2 text-lg font-semibold text-gray-900 hover:bg-gray-100"
          >
            ← Dia anterior
          </Link>
          <Link
            href={`/agenda?data=${proximo}`}
            className="rounded-xl border-2 border-gray-400 px-4 py-2 text-lg font-semibold text-gray-900 hover:bg-gray-100"
          >
            Próximo dia →
          </Link>
          {data !== hoje ? (
            <Link
              href="/agenda"
              className="rounded-xl border-2 border-sky-900 px-4 py-2 text-lg font-semibold text-sky-900 hover:bg-sky-50"
            >
              Voltar para hoje
            </Link>
          ) : null}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border-2 border-sky-200 bg-sky-50 px-4 py-3">
          <p className="text-base font-semibold text-sky-900">Em aberto</p>
          <p className="text-3xl font-bold text-sky-900">{ativas}</p>
        </div>
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-base font-semibold text-emerald-900">
            Realizadas ou faltas
          </p>
          <p className="text-3xl font-bold text-emerald-900">{concluidas}</p>
        </div>
        <div className="rounded-xl border-2 border-gray-300 bg-gray-100 px-4 py-3">
          <p className="text-base font-semibold text-gray-800">Canceladas</p>
          <p className="text-3xl font-bold text-gray-800">{canceladas}</p>
        </div>
      </section>

      {grupos.length === 0 ? (
        <Alerta tipo="aviso">
          Nenhuma consulta marcada neste dia.
          {podeMarcar ? (
            <>
              {" "}
              <Link href={`/consultas/nova?data=${data}`} className="underline">
                Marcar uma consulta
              </Link>
              .
            </>
          ) : null}
        </Alerta>
      ) : (
        <div className="space-y-6">
          {grupos.map((grupo) => (
            <section
              key={grupo.profissional_id}
              className="rounded-2xl border-2 border-gray-200 bg-white"
            >
              <header className="border-b-2 border-gray-200 px-6 py-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {grupo.profissional_nome}
                </h2>
                <p className="text-lg text-gray-700">{grupo.especialidade}</p>
              </header>

              <ul className="divide-y-2 divide-gray-100">
                {grupo.consultas.map((consulta) => (
                  <li
                    key={consulta.id}
                    className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <span className="w-20 shrink-0 text-2xl font-bold text-gray-900">
                        {formatarHora(consulta.inicio)}
                      </span>
                      <div>
                        <p className="text-xl font-semibold text-gray-900">
                          {consulta.paciente_nome}
                        </p>
                        <p className="text-base text-gray-600">
                          {formatarHora(consulta.inicio)} –{" "}
                          {formatarHora(consulta.fim)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-3 sm:items-end">
                      <StatusConsultaBadge status={consulta.status} />

                      <Link
                        href={`/consultas/${consulta.id}`}
                        className="rounded-xl border-2 border-gray-400 px-4 py-2 text-base font-semibold text-gray-900 hover:bg-gray-100 sm:text-lg"
                      >
                        Detalhes
                      </Link>

                      <AcoesConsulta
                        consulta={{
                          id: consulta.id,
                          status: consulta.status,
                          inicio: consulta.inicio,
                        }}
                        podeGerenciar={podeMarcar}
                        origem="agenda"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
