import Link from "next/link";

import { Alerta } from "@/components/alerta";
import { FormularioHorarios } from "@/components/formulario-horarios";
import { exigirPapel } from "@/lib/auth";
import {
  formatarIntervalo,
  hojeSP,
  limiteSP,
} from "@/lib/datahora";
import { listarHorariosDoDia } from "@/lib/dados/horarios";
import { listarProfissionaisAtivos } from "@/lib/dados/profissionais";
import { UUID_REGEX } from "@/lib/tipos";
import { normalizarDataFiltro } from "@/lib/validacao-agenda";

import { liberarHorarios, removerHorario } from "./actions";

function numero(valor: string | undefined): number {
  const convertido = Number.parseInt(valor ?? "", 10);
  return Number.isFinite(convertido) && convertido >= 0 ? convertido : 0;
}

function mensagemDeResultado(
  criados: number,
  reativados: number,
  ignorados: number,
): string {
  const partes: string[] = [];

  if (criados > 0) {
    partes.push(
      `${criados} ${criados === 1 ? "horário liberado" : "horários liberados"}`,
    );
  }

  if (reativados > 0) {
    partes.push(
      `${reativados} ${reativados === 1 ? "horário reativado" : "horários reativados"}`,
    );
  }

  if (ignorados > 0) {
    partes.push(
      `${ignorados} ${ignorados === 1 ? "horário ignorado" : "horários ignorados"} por já existir ou se sobrepor`,
    );
  }

  return partes.length > 0
    ? `${partes.join(". ")}.`
    : "Nenhum horário novo foi criado.";
}

export default async function HorariosPage({
  searchParams,
}: {
  searchParams: Promise<{
    profissional?: string;
    data?: string;
    criados?: string;
    reativados?: string;
    ignorados?: string;
    sucesso?: string;
    erro?: string;
  }>;
}) {
  const perfil = await exigirPapel("recepcao", "admin");
  const parametros = await searchParams;

  const profissionais = await listarProfissionaisAtivos();

  const profissionalSelecionado =
    typeof parametros.profissional === "string" &&
    UUID_REGEX.test(parametros.profissional) &&
    profissionais.some((item) => item.id === parametros.profissional)
      ? parametros.profissional
      : (profissionais[0]?.id ?? "");

  const dataSelecionada = normalizarDataFiltro(
    typeof parametros.data === "string" ? parametros.data : undefined,
    true,
  );

  const horarios = profissionalSelecionado
    ? await listarHorariosDoDia(profissionalSelecionado, dataSelecionada)
    : [];

  const temResultado =
    typeof parametros.criados === "string" ||
    typeof parametros.reativados === "string" ||
    typeof parametros.ignorados === "string";

  const mensagemSucesso =
    parametros.sucesso === "removido"
      ? "Horário removido. Ele não aparece mais para novas consultas."
      : temResultado
        ? mensagemDeResultado(
            numero(parametros.criados),
            numero(parametros.reativados),
            numero(parametros.ignorados),
          )
        : undefined;

  const mensagemErro =
    parametros.erro === "ocupado"
      ? "Só é possível remover horários livres."
      : parametros.erro === "invalido"
        ? "Horário inválido. Atualize a página e tente novamente."
        : parametros.erro === "salvar"
          ? "Não foi possível remover o horário. Tente novamente."
          : undefined;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Horários</h1>
        <p className="mt-2 text-xl text-gray-700">
          Libere vários horários de um profissional ativo e remova horários que
          ainda estejam livres.
        </p>
      </div>

      {mensagemSucesso ? (
        <Alerta tipo="sucesso">{mensagemSucesso}</Alerta>
      ) : null}
      {mensagemErro ? <Alerta tipo="erro">{mensagemErro}</Alerta> : null}

      {profissionais.length === 0 ? (
        <Alerta tipo="aviso">
          Nenhum profissional ativo. Ative um profissional antes de liberar
          horários.
          {perfil.papel === "admin" ? (
            <>
              {" "}
              <Link href="/profissionais" className="underline">
                Ir para profissionais
              </Link>
            </>
          ) : null}
        </Alerta>
      ) : (
        <>
          <section className="rounded-2xl border-2 border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Liberar horários
            </h2>
            <p className="mt-2 text-lg text-gray-700">
              Escolha o profissional, o dia, o intervalo e a duração. Vários
              horários são criados de uma vez.
            </p>

            <div className="mt-6">
              <FormularioHorarios
                acao={liberarHorarios}
                profissionais={profissionais.map((profissional) => ({
                  id: profissional.id,
                  nome: profissional.nome,
                  especialidade: profissional.especialidade,
                }))}
                hoje={hojeSP()}
                limite={limiteSP()}
                profissionalInicial={profissionalSelecionado}
                dataInicial={dataSelecionada}
              />
            </div>
          </section>

          <section className="rounded-2xl border-2 border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Ver horários de um dia
            </h2>

            <form
              method="get"
              action="/horarios"
              className="mt-4 grid gap-4 sm:grid-cols-2"
            >
              <div>
                <label
                  htmlFor="filtro-profissional"
                  className="block text-lg font-semibold text-gray-900"
                >
                  Profissional
                </label>
                <select
                  id="filtro-profissional"
                  name="profissional"
                  defaultValue={profissionalSelecionado}
                  className="mt-2 w-full rounded-xl border-2 border-gray-400 bg-white px-4 py-3 text-xl text-gray-900 focus:border-sky-800"
                >
                  {profissionais.map((profissional) => (
                    <option key={profissional.id} value={profissional.id}>
                      {profissional.nome} — {profissional.especialidade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="filtro-data"
                  className="block text-lg font-semibold text-gray-900"
                >
                  Data
                </label>
                <input
                  id="filtro-data"
                  name="data"
                  type="date"
                  min={hojeSP()}
                  max={limiteSP()}
                  defaultValue={dataSelecionada}
                  className="mt-2 w-full rounded-xl border-2 border-gray-400 bg-white px-4 py-3 text-xl text-gray-900 focus:border-sky-800"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-sky-900 px-6 py-3 text-xl font-bold text-white hover:bg-sky-800 sm:w-auto"
                >
                  Ver horários
                </button>
              </div>
            </form>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Horários do dia
            </h2>

            {horarios.length === 0 ? (
              <Alerta tipo="aviso">
                Nenhum horário cadastrado para este profissional nesta data.
              </Alerta>
            ) : (
              <ul className="space-y-3">
                {horarios.map((horario) => (
                  <li
                    key={horario.id}
                    className="flex flex-col gap-3 rounded-xl border-2 border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-xl font-bold text-gray-900">
                        {formatarIntervalo(horario.inicio, horario.fim)}
                      </p>
                      <p
                        className={`mt-1 inline-block rounded-lg border-2 px-3 py-1 text-base font-bold ${
                          horario.status === "livre"
                            ? "border-green-300 bg-green-100 text-green-900"
                            : "border-amber-300 bg-amber-100 text-amber-900"
                        }`}
                      >
                        {horario.status === "livre" ? "Livre" : "Ocupado"}
                      </p>
                    </div>

                    {horario.status === "livre" ? (
                      <form action={removerHorario}>
                        <input type="hidden" name="id" value={horario.id} />
                        <button
                          type="submit"
                          className="w-full rounded-xl border-2 border-gray-500 px-5 py-3 text-lg font-semibold text-gray-900 hover:bg-gray-100 sm:w-auto"
                        >
                          Remover horário
                        </button>
                      </form>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
