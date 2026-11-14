"use client";

import { useActionState } from "react";

import { Alerta } from "@/components/alerta";
import {
  ESTADO_INICIAL,
  type AcaoFormulario,
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

export function FormularioUsuario({ acao }: { acao: AcaoFormulario }) {
  const [estado, formAction, pendente] = useActionState(acao, ESTADO_INICIAL);
  const valores = estado.valores;

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {estado.erros.geral ? (
        <Alerta tipo="erro">{estado.erros.geral}</Alerta>
      ) : null}

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
          defaultValue={valores.nome ?? ""}
          aria-describedby={estado.erros.nome ? "erro-nome" : undefined}
          className={CLASSE_CAMPO}
        />
        <ErroDoCampo id="erro-nome" mensagem={estado.erros.nome} />
      </div>

      <div>
        <label htmlFor="email" className="block text-lg font-semibold text-gray-900">
          E-mail <span className="text-red-800">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="nome@exemplo.com"
          defaultValue={valores.email ?? ""}
          aria-describedby={estado.erros.email ? "erro-email" : undefined}
          className={CLASSE_CAMPO}
        />
        <ErroDoCampo id="erro-email" mensagem={estado.erros.email} />
      </div>

      <div>
        <label htmlFor="senha" className="block text-lg font-semibold text-gray-900">
          Senha inicial <span className="text-red-800">*</span>
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          aria-describedby={
            estado.erros.senha ? "erro-senha" : "ajuda-senha"
          }
          className={CLASSE_CAMPO}
        />
        <p id="ajuda-senha" className="mt-2 text-base text-gray-600">
          Mínimo de 8 caracteres. A senha não será exibida novamente depois do
          cadastro.
        </p>
        <ErroDoCampo id="erro-senha" mensagem={estado.erros.senha} />
      </div>

      <div>
        <label htmlFor="papel" className="block text-lg font-semibold text-gray-900">
          Papel no sistema <span className="text-red-800">*</span>
        </label>
        <select
          id="papel"
          name="papel"
          defaultValue={valores.papel ?? "recepcao"}
          aria-describedby={estado.erros.papel ? "erro-papel" : undefined}
          className={CLASSE_CAMPO}
        >
          <option value="recepcao">Recepção</option>
          <option value="profissional">Profissional de saúde</option>
          <option value="admin">Administrador</option>
        </select>
        <ErroDoCampo id="erro-papel" mensagem={estado.erros.papel} />
      </div>

      <button
        type="submit"
        disabled={pendente}
        className="rounded-xl bg-sky-900 px-6 py-4 text-xl font-bold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pendente ? "Criando..." : "Criar usuário"}
      </button>
    </form>
  );
}
