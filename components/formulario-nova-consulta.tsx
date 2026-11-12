"use client";

import { useActionState } from "react";

import { Alerta } from "@/components/alerta";
import { ESTADO_INICIAL, type AcaoFormulario } from "@/lib/tipos";

type PacienteOpcao = {
  id: string;
  nome: string;
  cpfFormatado: string;
};

type HorarioOpcao = {
  id: string;
  rotulo: string;
};

export function FormularioNovaConsulta({
  acao,
  pacientes,
  horarios,
}: {
  acao: AcaoFormulario;
  pacientes: PacienteOpcao[];
  horarios: HorarioOpcao[];
}) {
  const [estado, formAction, pendente] = useActionState(acao, ESTADO_INICIAL);
  const valores = estado.valores;
  const podeEnviar = pacientes.length > 0 && horarios.length > 0;

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {estado.erros.geral ? (
        <Alerta tipo="erro">{estado.erros.geral}</Alerta>
      ) : null}

      <fieldset>
        <legend className="text-xl font-bold text-gray-900">
          1. Escolha o paciente <span className="text-red-800">*</span>
        </legend>

        {pacientes.length === 0 ? (
          <div className="mt-3">
            <Alerta tipo="aviso">
              Nenhum paciente encontrado. Ajuste a busca acima.
            </Alerta>
          </div>
        ) : (
          <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto rounded-xl border-2 border-gray-200 bg-white p-3">
            {pacientes.map((paciente) => (
              <li key={paciente.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg p-3 hover:bg-sky-50">
                  <input
                    type="radio"
                    name="paciente_id"
                    value={paciente.id}
                    required
                    defaultChecked={valores.paciente_id === paciente.id}
                    className="mt-1 h-6 w-6 accent-sky-900"
                  />
                  <span>
                    <span className="block text-lg font-semibold text-gray-900">
                      {paciente.nome}
                    </span>
                    <span className="block text-base text-gray-700">
                      CPF/Cartão SUS: {paciente.cpfFormatado}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}

        {estado.erros.paciente_id ? (
          <p role="alert" className="mt-2 text-base font-semibold text-red-800">
            {estado.erros.paciente_id}
          </p>
        ) : null}
      </fieldset>

      <fieldset>
        <legend className="text-xl font-bold text-gray-900">
          2. Escolha o horário livre <span className="text-red-800">*</span>
        </legend>

        {horarios.length === 0 ? (
          <div className="mt-3">
            <Alerta tipo="aviso">
              Nenhum horário livre para este profissional neste dia. Escolha
              outro dia ou libere novos horários.
            </Alerta>
          </div>
        ) : (
          <ul className="mt-3 grid gap-2 rounded-xl border-2 border-gray-200 bg-white p-3 sm:grid-cols-2">
            {horarios.map((horario) => (
              <li key={horario.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-sky-50">
                  <input
                    type="radio"
                    name="horario_id"
                    value={horario.id}
                    required
                    defaultChecked={valores.horario_id === horario.id}
                    className="h-6 w-6 accent-sky-900"
                  />
                  <span className="text-lg font-semibold text-gray-900">
                    {horario.rotulo}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}

        {estado.erros.horario_id ? (
          <p role="alert" className="mt-2 text-base font-semibold text-red-800">
            {estado.erros.horario_id}
          </p>
        ) : null}
      </fieldset>

      <button
        type="submit"
        disabled={pendente || !podeEnviar}
        className="w-full rounded-xl bg-sky-900 px-6 py-4 text-xl font-bold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {pendente ? "Agendando..." : "Agendar consulta"}
      </button>
    </form>
  );
}
