import { Alerta } from "@/components/alerta";
import { BotaoConfirmar } from "@/components/botao-confirmar";
import { dataSP, estaNoFuturo, hojeSP } from "@/lib/datahora";
import { MENSAGEM_DATA_FUTURA } from "@/lib/mensagens-consulta";
import type { StatusConsulta } from "@/lib/tipos";

import {
  cancelarConsulta,
  desfazerPresenca,
  marcarPresenca,
} from "./actions";

const ESTILO_REALIZADA =
  "rounded-xl border-2 border-emerald-700 bg-emerald-50 px-4 py-2 text-base font-bold text-emerald-900 hover:bg-emerald-100 sm:text-lg";
const ESTILO_FALTOU =
  "rounded-xl border-2 border-red-700 bg-red-50 px-4 py-2 text-base font-bold text-red-900 hover:bg-red-100 sm:text-lg";
const ESTILO_DESFAZER =
  "rounded-xl border-2 border-amber-700 bg-amber-50 px-4 py-2 text-base font-bold text-amber-900 hover:bg-amber-100 sm:text-lg";
const ESTILO_CANCELAR =
  "rounded-xl border-2 border-red-700 px-5 py-3 text-lg font-bold text-red-900 hover:bg-red-50";

type ConsultaAcao = {
  id: string;
  status: StatusConsulta;
  inicio: string;
};

/**
 * Botões de cancelar, marcar presença/falta e desfazer.
 * As regras aqui são só visuais; cada Server Action reconfere papel,
 * status e data antes de gravar.
 */
export function AcoesConsulta({
  consulta,
  podeGerenciar,
  origem,
  mostrarVazio = false,
}: {
  consulta: ConsultaAcao;
  podeGerenciar: boolean;
  origem: "agenda" | "detalhe";
  mostrarVazio?: boolean;
}) {
  if (!podeGerenciar) {
    return null;
  }

  const diaDaConsulta = dataSP(consulta.inicio);
  const hoje = hojeSP();
  const emAberto =
    consulta.status === "agendada" || consulta.status === "confirmada";
  const concluida =
    consulta.status === "realizada" || consulta.status === "faltou";

  const podePresenca = emAberto && diaDaConsulta <= hoje;
  const podeDesfazer = concluida && diaDaConsulta <= hoje;
  const podeCancelar =
    origem === "detalhe" && emAberto && estaNoFuturo(consulta.inicio);
  const avisoFuturo = origem === "detalhe" && emAberto && diaDaConsulta > hoje;

  const temBotoes = podePresenca || podeDesfazer || podeCancelar;

  if (!temBotoes && !avisoFuturo) {
    return mostrarVazio ? (
      <p className="text-lg text-gray-700">
        Nenhuma ação disponível para esta consulta.
      </p>
    ) : null;
  }

  const retorno = origem === "detalhe" ? "detalhe" : "agenda";

  return (
    <div className="space-y-3">
      {temBotoes ? (
        <div className="flex flex-wrap gap-2">
          {podePresenca ? (
            <>
              <form action={marcarPresenca}>
                <input type="hidden" name="id" value={consulta.id} />
                <input type="hidden" name="retorno" value={retorno} />
                <input type="hidden" name="resultado" value="realizada" />
                <button type="submit" className={ESTILO_REALIZADA}>
                  Realizada
                </button>
              </form>

              <form action={marcarPresenca}>
                <input type="hidden" name="id" value={consulta.id} />
                <input type="hidden" name="retorno" value={retorno} />
                <input type="hidden" name="resultado" value="faltou" />
                <button type="submit" className={ESTILO_FALTOU}>
                  Faltou
                </button>
              </form>
            </>
          ) : null}

          {podeDesfazer ? (
            <form action={desfazerPresenca}>
              <input type="hidden" name="id" value={consulta.id} />
              <input type="hidden" name="retorno" value={retorno} />
              <BotaoConfirmar
                mensagem="Desfazer a presença? A consulta volta para Agendada."
                className={ESTILO_DESFAZER}
              >
                Desfazer
              </BotaoConfirmar>
            </form>
          ) : null}

          {podeCancelar ? (
            <form action={cancelarConsulta}>
              <input type="hidden" name="id" value={consulta.id} />
              <input type="hidden" name="retorno" value={retorno} />
              <BotaoConfirmar
                mensagem="Cancelar esta consulta? O horário voltará a ficar livre."
                className={ESTILO_CANCELAR}
              >
                Cancelar consulta
              </BotaoConfirmar>
            </form>
          ) : null}
        </div>
      ) : null}

      {avisoFuturo ? <Alerta tipo="aviso">{MENSAGEM_DATA_FUTURA}</Alerta> : null}
    </div>
  );
}
