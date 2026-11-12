"use client";

import { useActionState } from "react";

import { Alerta } from "@/components/alerta";
import {
  ESTADO_INICIAL,
  type AcaoFormulario,
} from "@/lib/tipos";
import { DURACOES_PERMITIDAS } from "@/lib/validacao-agenda";

const CLASSE_CAMPO =
  "mt-2 w-full rounded-xl border-2 border-gray-400 bg-white px-4 py-3 text-xl text-gray-900 focus:border-sky-800";

type ProfissionalOpcao = {
  id: string;
  nome: string;
  especialidade: string;
};

function ErroDoCampo({ id, mensagem }: { id: string; mensagem?: string }) {
  if (!mensagem) {
    return null;
  }

  return (
    <p id={id} role="alert" className="mt-2 text-base font-semibold text-red-800">
      {mensagem}
    </p>
  );
}

export function FormularioHorarios({
  acao,
  profissionais,
  hoje,
  limite,
  profissionalInicial,
  dataInicial,
}: {
  acao: AcaoFormulario;
  profissionais: ProfissionalOpcao[];
  hoje: string;
  limite: string;
  profissionalInicial: string;
  dataInicial: string;
}) {
  const [estado, formAction, pendente] = useActionState(acao, ESTADO_INICIAL);
  const valores = estado.valores;

  const profissionalId = valores.profissional_id ?? profissionalInicial;
  const data = valores.data ?? dataInicial;
  const horaInicial = valores.hora_inicial ?? "08:00";
  const horaFinal = valores.hora_final ?? "10:00";
  const duracao = valores.duracao ?? "30";

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {estado.erros.geral ? (
        <Alerta tipo="erro">{estado.erros.geral}</Alerta>
      ) : null}

      <div>
        <label
          htmlFor="profissional_id"
          className="block text-lg font-semibold text-gray-900"
        >
          Profissional ativo <span className="text-red-800">*</span>
        </label>
        <select
          id="profissional_id"
          name="profissional_id"
          required
          defaultValue={profissionalId}
          aria-describedby={
            estado.erros.profissional_id ? "erro-profissional" : undefined
          }
          className={CLASSE_CAMPO}
        >
          {profissionais.map((profissional) => (
            <option key={profissional.id} value={profissional.id}>
              {profissional.nome} — {profissional.especialidade}
            </option>
          ))}
        </select>
        <ErroDoCampo
          id="erro-profissional"
          mensagem={estado.erros.profissional_id}
        />
      </div>

      <div>
        <label htmlFor="data" className="block text-lg font-semibold text-gray-900">
          Data <span className="text-red-800">*</span>
        </label>
        <input
          id="data"
          name="data"
          type="date"
          required
          min={hoje}
          max={limite}
          defaultValue={data}
          aria-describedby={estado.erros.data ? "erro-data" : "ajuda-data"}
          className={CLASSE_CAMPO}
        />
        <p id="ajuda-data" className="mt-2 text-base text-gray-600">
          De hoje até 30 dias à frente.
        </p>
        <ErroDoCampo id="erro-data" mensagem={estado.erros.data} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="hora_inicial"
            className="block text-lg font-semibold text-gray-900"
          >
            Hora inicial <span className="text-red-800">*</span>
          </label>
          <input
            id="hora_inicial"
            name="hora_inicial"
            type="time"
            required
            defaultValue={horaInicial}
            aria-describedby={
              estado.erros.hora_inicial ? "erro-hora-inicial" : undefined
            }
            className={CLASSE_CAMPO}
          />
          <ErroDoCampo
            id="erro-hora-inicial"
            mensagem={estado.erros.hora_inicial}
          />
        </div>

        <div>
          <label
            htmlFor="hora_final"
            className="block text-lg font-semibold text-gray-900"
          >
            Hora final <span className="text-red-800">*</span>
          </label>
          <input
            id="hora_final"
            name="hora_final"
            type="time"
            required
            defaultValue={horaFinal}
            aria-describedby={
              estado.erros.hora_final ? "erro-hora-final" : undefined
            }
            className={CLASSE_CAMPO}
          />
          <ErroDoCampo
            id="erro-hora-final"
            mensagem={estado.erros.hora_final}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="duracao"
          className="block text-lg font-semibold text-gray-900"
        >
          Duração de cada consulta <span className="text-red-800">*</span>
        </label>
        <select
          id="duracao"
          name="duracao"
          required
          defaultValue={duracao}
          aria-describedby={
            estado.erros.duracao ? "erro-duracao" : "ajuda-duracao"
          }
          className={CLASSE_CAMPO}
        >
          {DURACOES_PERMITIDAS.map((minutos) => (
            <option key={minutos} value={minutos}>
              {minutos} minutos
            </option>
          ))}
        </select>
        <p id="ajuda-duracao" className="mt-2 text-base text-gray-600">
          Os horários são criados de {horaInicial} até {horaFinal}. Horários que
          não couberem inteiros no intervalo são ignorados.
        </p>
        <ErroDoCampo id="erro-duracao" mensagem={estado.erros.duracao} />
      </div>

      <button
        type="submit"
        disabled={pendente || profissionais.length === 0}
        className="w-full rounded-xl bg-sky-900 px-6 py-4 text-xl font-bold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {pendente ? "Liberando..." : "Liberar horários"}
      </button>
    </form>
  );
}
