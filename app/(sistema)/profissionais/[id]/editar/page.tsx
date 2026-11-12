import Link from "next/link";
import { notFound } from "next/navigation";

import { FormularioProfissional } from "@/components/formulario-profissional";
import { exigirPapel } from "@/lib/auth";
import { buscarProfissional } from "@/lib/dados/profissionais";

import { editarProfissional } from "../../actions";

export default async function EditarProfissionalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await exigirPapel("admin");

  const { id } = await params;
  const profissional = await buscarProfissional(id);

  if (!profissional) {
    notFound();
  }

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
          Editar profissional
        </h1>
        <p className="mt-2 text-xl text-gray-700">{profissional.nome}</p>
      </div>

      <section className="rounded-2xl border-2 border-gray-200 bg-white p-6 sm:p-8">
        <FormularioProfissional
          acao={editarProfissional}
          profissional={profissional}
        />
      </section>
    </div>
  );
}
