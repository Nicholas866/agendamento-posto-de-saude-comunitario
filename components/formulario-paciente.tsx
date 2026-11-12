"use client";

import Link from "next/link";
import { useActionState, type FormEvent } from "react";

import { Alerta } from "@/components/alerta";
import { somenteDigitos } from "@/lib/formatacao";
import {
  ESTADO_INICIAL,
  type AcaoFormulario,
  type Paciente,
} from "@/lib/tipos";

const CLASSE_CAMPO =
  "mt-2 w-full rounded-xl border-2 border-gray-400 bg-white px-4 py-3 text-xl text-gray-900 focus:border-sky-800";

/** Aceita apenas dígitos, ignorando letras e pontuação, até o limite. */
function limitarDigitos(maximo: number) {
  return (evento: FormEvent<HTMLInputElement>) => {
    const campo = evento.currentTarget;
    const digitos = somenteDigitos(campo.value).slice(0, maximo);

    if (campo.value !== digitos) {
      campo.value = digitos;
    }
  };
}

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

export function FormularioPaciente({
  acao,
  paciente,
}: {
  acao: AcaoFormulario;
  paciente?: Paciente;
}) {
  const [estado, formAction, pendente] = useActionState(acao, ESTADO_INICIAL);
  const valores = estado.valores;

  const nome = valores.nome ?? paciente?.nome ?? "";
  const cpf =
    valores.cpf_ou_cartao_sus ??
    (paciente ? somenteDigitos(paciente.cpf_ou_cartao_sus) : "");
  const telefone =
    valores.telefone ?? (paciente ? somenteDigitos(paciente.telefone) : "");
  const email = valores.email ?? paciente?.email ?? "";
  const canal = valores.canal_preferido ?? paciente?.canal_preferido ?? "email";

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {paciente ? <input type="hidden" name="id" value={paciente.id} /> : null}

      {estado.erros.geral ? <Alerta tipo="erro">{estado.erros.geral}</Alerta> : null}

      <div>
        <label htmlFor="nome" className="block text-lg font-semibold text-gray-900">
          Nome completo <span className="text-red-800">*</span>
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          required
          autoComplete="name"
          defaultValue={nome}
          aria-describedby={estado.erros.nome ? "erro-nome" : undefined}
          className={CLASSE_CAMPO}
        />
        <ErroDoCampo id="erro-nome" mensagem={estado.erros.nome} />
      </div>

      <div>
        <label
          htmlFor="cpf_ou_cartao_sus"
          className="block text-lg font-semibold text-gray-900"
        >
          CPF ou Cartão SUS <span className="text-red-800">*</span>
        </label>
        <input
          id="cpf_ou_cartao_sus"
          name="cpf_ou_cartao_sus"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          required
          placeholder="Somente números"
          defaultValue={cpf}
          onInput={limitarDigitos(15)}
          aria-describedby={
            estado.erros.cpf_ou_cartao_sus ? "erro-cpf" : "ajuda-cpf"
          }
          className={CLASSE_CAMPO}
        />
        <p id="ajuda-cpf" className="mt-2 text-base text-gray-600">
          CPF: 11 dígitos · Cartão SUS: 15 dígitos. Só números; pontos e traços
          são removidos automaticamente.
        </p>
        <ErroDoCampo
          id="erro-cpf"
          mensagem={estado.erros.cpf_ou_cartao_sus}
        />
      </div>

      <div>
        <label
          htmlFor="telefone"
          className="block text-lg font-semibold text-gray-900"
        >
          Telefone com DDD <span className="text-red-800">*</span>
        </label>
        <input
          id="telefone"
          name="telefone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          required
          placeholder="Somente números com DDD"
          defaultValue={telefone}
          onInput={limitarDigitos(11)}
          aria-describedby={
            estado.erros.telefone ? "erro-telefone" : "ajuda-telefone"
          }
          className={CLASSE_CAMPO}
        />
        <p id="ajuda-telefone" className="mt-2 text-base text-gray-600">
          Telefone com DDD: 10 ou 11 dígitos. Só números.
        </p>
        <ErroDoCampo id="erro-telefone" mensagem={estado.erros.telefone} />
      </div>

      <div>
        <label htmlFor="email" className="block text-lg font-semibold text-gray-900">
          E-mail (opcional)
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nome@exemplo.com"
          defaultValue={email}
          aria-describedby={estado.erros.email ? "erro-email" : undefined}
          className={CLASSE_CAMPO}
        />
        <ErroDoCampo id="erro-email" mensagem={estado.erros.email} />
      </div>

      <div>
        <label
          htmlFor="canal_preferido"
          className="block text-lg font-semibold text-gray-900"
        >
          Canal de aviso preferido
        </label>
        <select
          id="canal_preferido"
          name="canal_preferido"
          defaultValue={canal}
          aria-describedby={
            estado.erros.canal_preferido ? "erro-canal" : undefined
          }
          className={CLASSE_CAMPO}
        >
          <option value="email">E-mail</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="sms">SMS</option>
        </select>
        <ErroDoCampo
          id="erro-canal"
          mensagem={estado.erros.canal_preferido}
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
          href="/pacientes"
          className="rounded-xl border-2 border-gray-400 px-6 py-4 text-center text-xl font-semibold text-gray-900 hover:bg-gray-100"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
