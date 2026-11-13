import { Alerta } from "@/components/alerta";
import { formatarNumero, formatarPorcentagem } from "@/lib/formatacao";

export type ItemGraficoBarras = {
  rotulo: string;
  faltas: number;
  vencidas: number;
  taxa: number | null;
};

function textoDoItem(item: ItemGraficoBarras): string {
  if (item.taxa === null) {
    return "Sem consultas vencidas";
  }

  const faltas = `${formatarNumero(item.faltas)} ${
    item.faltas === 1 ? "falta" : "faltas"
  }`;

  return `${faltas} / ${formatarNumero(item.vencidas)} vencidas · ${formatarPorcentagem(item.taxa)}`;
}

export function GraficoBarras({
  titulo,
  descricao,
  itens,
}: {
  titulo: string;
  descricao: string;
  itens: ItemGraficoBarras[];
}) {
  return (
    <section className="rounded-2xl border-2 border-gray-200 bg-white p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900">{titulo}</h2>
      <p className="mt-2 text-lg text-gray-700">{descricao}</p>

      {itens.length === 0 ? (
        <div className="mt-4">
          <Alerta tipo="aviso">Sem dados para montar o gráfico.</Alerta>
        </div>
      ) : (
        <ul className="mt-6 space-y-5">
          {itens.map((item, indice) => {
            const largura =
              item.taxa === null ? 0 : Math.min(100, Math.max(0, item.taxa));

            return (
              <li key={`${item.rotulo}-${indice}`}>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                  <span className="text-lg font-semibold text-gray-900">
                    {item.rotulo}
                  </span>
                  <span className="text-base font-semibold text-gray-800">
                    {textoDoItem(item)}
                  </span>
                </div>
                <div
                  aria-hidden="true"
                  className="mt-2 h-5 w-full overflow-hidden rounded-full border border-gray-300 bg-gray-100"
                >
                  <div
                    className="h-full rounded-full bg-sky-900"
                    style={{ width: `${largura}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
