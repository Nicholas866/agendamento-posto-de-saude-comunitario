import type { ContagemStatus } from "@/lib/dados/painel";
import { formatarNumero, formatarPorcentagem } from "@/lib/formatacao";
import type { StatusConsulta } from "@/lib/tipos";

const STATUS: Array<{ chave: StatusConsulta; rotulo: string }> = [
  { chave: "agendada", rotulo: "Agendada" },
  { chave: "confirmada", rotulo: "Confirmada" },
  { chave: "cancelada", rotulo: "Cancelada" },
  { chave: "faltou", rotulo: "Faltou" },
  { chave: "realizada", rotulo: "Realizada" },
];

export type LinhaTabelaContagens = {
  chave: string;
  rotulo: string;
  contagens: ContagemStatus;
  vencidas: number;
  faltas: number;
  taxa: number | null;
};

export function TabelaContagens({
  titulo,
  rotuloColuna,
  linhas,
}: {
  titulo: string;
  rotuloColuna: string;
  linhas: LinhaTabelaContagens[];
}) {
  return (
    <section className="rounded-2xl border-2 border-gray-200 bg-white p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900">{titulo}</h2>
      <p className="mt-2 text-lg text-gray-700">
        Vencidas = consultas com horário já passado, excluindo canceladas.
      </p>

      <div className="mt-4 hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <caption className="sr-only">{titulo}</caption>
          <thead>
            <tr className="bg-gray-100">
              <th
                scope="col"
                className="px-4 py-3 text-base font-bold text-gray-900"
              >
                {rotuloColuna}
              </th>
              {STATUS.map((status) => (
                <th
                  key={status.chave}
                  scope="col"
                  className="px-3 py-3 text-right text-base font-bold text-gray-900"
                >
                  {status.rotulo}
                </th>
              ))}
              <th
                scope="col"
                className="px-3 py-3 text-right text-base font-bold text-gray-900"
              >
                Vencidas
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-right text-base font-bold text-gray-900"
              >
                Taxa
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-gray-100">
            {linhas.map((linha) => (
              <tr key={linha.chave}>
                <th
                  scope="row"
                  className="px-4 py-3 text-lg font-semibold text-gray-900"
                >
                  {linha.rotulo}
                </th>
                {STATUS.map((status) => (
                  <td
                    key={status.chave}
                    className="px-3 py-3 text-right text-lg tabular-nums text-gray-800"
                  >
                    {formatarNumero(linha.contagens[status.chave])}
                  </td>
                ))}
                <td className="px-3 py-3 text-right text-lg tabular-nums text-gray-800">
                  {formatarNumero(linha.vencidas)}
                </td>
                <td className="px-3 py-3 text-right text-lg font-bold tabular-nums text-gray-900">
                  {formatarPorcentagem(linha.taxa)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-4 space-y-3 sm:hidden">
        {linhas.map((linha) => (
          <li
            key={linha.chave}
            className="rounded-xl border-2 border-gray-200 bg-white p-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-lg font-bold text-gray-900">{linha.rotulo}</h3>
              <span className="text-lg font-bold tabular-nums text-gray-900">
                {formatarPorcentagem(linha.taxa)}
              </span>
            </div>
            <p className="mt-1 text-base text-gray-700">
              {formatarNumero(linha.faltas)}{" "}
              {linha.faltas === 1 ? "falta" : "faltas"} /{" "}
              {formatarNumero(linha.vencidas)} vencidas
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-base text-gray-800">
              {STATUS.map((status) => (
                <div
                  key={status.chave}
                  className="flex justify-between gap-2"
                >
                  <dt>{status.rotulo}</dt>
                  <dd className="font-semibold tabular-nums">
                    {formatarNumero(linha.contagens[status.chave])}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}
