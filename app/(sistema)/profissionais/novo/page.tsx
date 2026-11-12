import Link from "next/link";

import { FormularioProfissional } from "@/components/formulario-profissional";
import { exigirPapel } from "@/lib/auth";

import { criarProfissional } from "../actions";

export default async function NovoProfissionalPage() {
  await exigirPapel("admin");

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/profissionais"
          className="text-lg font-semibold text-sky-900 underline"
        >
          ← Voltar para profissionais
        </Link>
        <h1 className="mt-3 text-4xl font-bold text-gray-900">
          Novo profissional
        </h1>
        <p className="mt-2 text-xl text-gray-700">
          O profissional é criado já ativo.
        </p>
      </div>

      <section className="rounded-2xl border-2 border-gray-200 bg-white p-6 sm:p-8">
        <FormularioProfissional acao={criarProfissional} />
      </section>
    </div>
  );
}
