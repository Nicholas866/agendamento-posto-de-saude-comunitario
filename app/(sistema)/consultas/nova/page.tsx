import Link from "next/link";

import { Alerta } from "@/components/alerta";
import { FormularioNovaConsulta } from "@/components/formulario-nova-consulta";
import { exigirPapel } from "@/lib/auth";
import {
  formatarData,
  formatarIntervalo,
  hojeSP,
  limiteSP,
  paraISO,
} from "@/lib/datahora";
import { listarHorariosLivres } from "@/lib/dados/horarios";
import { listarPacientes } from "@/lib/dados/pacientes";
import { listarProfissionaisAtivos } from "@/lib/dados/profissionais";
import { formatarCpfOuCartao } from "@/lib/formatacao";
import { UUID_REGEX } from "@/lib/tipos";
import { normalizarDataFiltro } from "@/lib/validacao-agenda";

import { criarConsulta } from "../actions";

const LIMITE_PACIENTES = 50;

export default async function NovaConsultaPage({
  searchParams,
}: {
  searchParams: Promise<{
    profissional?: string;
    data?: string;
    q?: string;
  }>;
}) {
  await exigirPapel("recepcao", "admin");

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

  const termo = typeof parametros.q === "string" ? parametros.q : "";

  const [pacientes, horarios] = await Promise.all([
    listarPacientes(termo, LIMITE_PACIENTES),
    profissionalSelecionado
      ? listarHorariosLivres(profissionalSelecionado, dataSelecionada)
      : Promise.resolve([]),
  ]);

  const profissional = profissionais.find(
    (item) => item.id === profissionalSelecionado,
  );

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/agenda?data=${dataSelecionada}`}
          className="text-lg font-semibold text-sky-900 underline"
        >
          ← Voltar para a agenda
        </Link>
        <h1 className="mt-3 text-4xl font-bold text-gray-900">Nova consulta</h1>
        <p className="mt-2 text-xl text-gray-700">
          Escolha o profissional, o dia e o paciente. Só aparecem horários
          livres, de hoje até 30 dias à frente.
        </p>
      </div>

      {profissionais.length === 0 ? (
        <Alerta tipo="aviso">
          Nenhum profissional ativo. Ative um profissional antes de marcar
          consultas.
        </Alerta>
      ) : (
        <>
          <section className="rounded-2xl border-2 border-gray-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Escolha o dia e o profissional
            </h2>

            <form
              method="get"
              action="/consultas/nova"
              className="mt-4 grid gap-4 sm:grid-cols-2"
            >
              <div>
                <label
                  htmlFor="profissional"
                  className="block text-lg font-semibold text-gray-900"
                >
                  Profissional ativo
                </label>
                <select
                  id="profissional"
                  name="profissional"
                  defaultValue={profissionalSelecionado}
                  className="mt-2 w-full rounded-xl border-2 border-gray-400 bg-white px-4 py-3 text-xl text-gray-900 focus:border-sky-800"
                >
                  {profissionais.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nome} — {item.especialidade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="data"
                  className="block text-lg font-semibold text-gray-900"
                >
                  Data
                </label>
                <input
                  id="data"
                  name="data"
                  type="date"
                  min={hojeSP()}
                  max={limiteSP()}
                  defaultValue={dataSelecionada}
                  className="mt-2 w-full rounded-xl border-2 border-gray-400 bg-white px-4 py-3 text-xl text-gray-900 focus:border-sky-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="q"
                  className="block text-lg font-semibold text-gray-900"
                >
                  Buscar paciente
                </label>
                <input
                  id="q"
                  name="q"
                  type="search"
                  defaultValue={termo}
                  placeholder="Nome, CPF ou Cartão SUS"
                  className="mt-2 w-full rounded-xl border-2 border-gray-400 bg-white px-4 py-3 text-xl text-gray-900 focus:border-sky-800"
                />
                <p className="mt-2 text-base text-gray-600">
                  A lista mostra até {LIMITE_PACIENTES} pacientes. Se o paciente
                  não aparecer, refine a busca ou{" "}
                  <Link href="/pacientes/novo" className="underline">
                    cadastre um novo paciente
                  </Link>
                  .
                </p>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-sky-900 px-6 py-3 text-xl font-bold text-white hover:bg-sky-800 sm:w-auto"
                >
                  Atualizar lista
                </button>
              </div>
            </form>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Horários livres de {profissional?.nome ?? "profissional"} em{" "}
              {formatarData(paraISO(dataSelecionada, "12:00"))}
            </h2>

            {horarios.length === 0 ? (
              <Alerta tipo="aviso">
                Nenhum horário livre para este profissional neste dia. Escolha
                outro dia ou libere novos horários em{" "}
                <Link href="/horarios" className="underline">
                  Horários
                </Link>
                .
              </Alerta>
            ) : null}

            <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 sm:p-8">
              <FormularioNovaConsulta
                acao={criarConsulta}
                pacientes={pacientes.map((paciente) => ({
                  id: paciente.id,
                  nome: paciente.nome,
                  cpfFormatado: formatarCpfOuCartao(
                    paciente.cpf_ou_cartao_sus,
                  ),
                }))}
                horarios={horarios.map((horario) => ({
                  id: horario.id,
                  rotulo: formatarIntervalo(horario.inicio, horario.fim),
                }))}
              />
            </div>

            {termo && pacientes.length === LIMITE_PACIENTES ? (
              <p className="text-base text-gray-600">
                Mostrando os {LIMITE_PACIENTES} primeiros pacientes da busca.
                Refine o termo para encontrar outros.
              </p>
            ) : null}
          </section>
        </>
      )}
    </div>
  );
}
