"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Alerta } from "@/components/alerta";
import {
  ESTADO_INICIAL,
  type AcaoFormulario,
  type Profissional,
} from "@/lib/tipos";

const CLASSE_CAMPO =
  "mt-2 w-full rounded-xl border-2 border-gray-400 bg-white px-4 py-3 text-xl text-gray-900 focus:border-sky-800";

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

export function FormularioProfissional({
  acao,
  profissional,
}: {
  acao: AcaoFormulario;
  profissional?: Profissional;
}) {
  const [estado, formAction, pendente] = useActionState(acao, ESTADO_INICIAL);
  const valores = estado.valores;

  const nome = valores.nome ?? profissional?.nome ?? "";
  const especialidade =
    valores.especialidade ?? profissional?.especialidade ?? "";

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {profissional ? (
        <input type="hidden" name="id" value={profissional.id} />
      ) : null}

      {estado.erros.geral ? <Alerta tipo="erro">{estado.erros.geral}</Alerta> : null}

      <div>
        <label htmlFor="nome" className="block text-lg font-semibold text-gray-900">
          Nome do profissional <span className="text-red-800">*</span>
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          required
          defaultValue={nome}
          aria-describedby={estado.erros.nome ? "erro-nome" : undefined}
          className={CLASSE_CAMPO}
        />
        <ErroDoCampo id="erro-nome" mensagem={estado.erros.nome} />
      </div>

      <div>
        <label
          htmlFor="especialidade"
          className="block text-lg font-semibold text-gray-900"
        >
          Especialidade <span className="text-red-800">*</span>
        </label>
        <input
          id="especialidade"
          name="especialidade"
          type="text"
          required
          placeholder="Ex.: Clínica geral, Enfermagem"
          defaultValue={especialidade}
          aria-describedby={
            estado.erros.especialidade ? "erro-especialidade" : undefined
          }
          className={CLASSE_CAMPO}
        />
        <ErroDoCampo
          id="erro-especialidade"
          mensagem={estado.erros.especialidade}
        />
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          type="submit"
          disabled={pendente}
          className="rounded-xl bg-sky-900 px-6 py-4 text-xl font-bold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendente ? "Salvando..." : "Salvar"}
        </button>
        <Link
          href="/profissionais"
          className="rounded-xl border-2 border-gray-400 px-6 py-4 text-center text-xl font-semibold text-gray-900 hover:bg-gray-100"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
