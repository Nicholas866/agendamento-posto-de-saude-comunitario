import Link from "next/link";

import { FormularioPaciente } from "@/components/formulario-paciente";
import { exigirPapel } from "@/lib/auth";

import { criarPaciente } from "../actions";

export default async function NovoPacientePage() {
  await exigirPapel("recepcao", "admin");

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/pacientes"
          className="text-lg font-semibold text-sky-900 underline"
        >
          ← Voltar para pacientes
        </Link>
        <h1 className="mt-3 text-4xl font-bold text-gray-900">
          Novo paciente
        </h1>
        <p className="mt-2 text-xl text-gray-700">
          Preencha os dados de contato. Não registre informações clínicas.
        </p>
      </div>

      <section className="rounded-2xl border-2 border-gray-200 bg-white p-6 sm:p-8">
        <FormularioPaciente acao={criarPaciente} />
      </section>
    </div>
  );
}
