import Link from "next/link";
import { notFound } from "next/navigation";

import { FormularioPaciente } from "@/components/formulario-paciente";
import { exigirPapel } from "@/lib/auth";
import { buscarPaciente } from "@/lib/dados/pacientes";

import { editarPaciente } from "../../actions";

export default async function EditarPacientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await exigirPapel("recepcao", "admin");

  const { id } = await params;
  const paciente = await buscarPaciente(id);

  if (!paciente) {
    notFound();
  }

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
          Editar paciente
        </h1>
        <p className="mt-2 text-xl text-gray-700">{paciente.nome}</p>
      </div>

      <section className="rounded-2xl border-2 border-gray-200 bg-white p-6 sm:p-8">
        <FormularioPaciente acao={editarPaciente} paciente={paciente} />
      </section>
    </div>
  );
}
