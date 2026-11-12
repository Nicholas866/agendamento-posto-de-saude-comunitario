import { exigirPerfil } from "@/lib/auth";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const perfil = await exigirPerfil();
  const { erro } = await searchParams;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Agenda do dia</h1>
        <p className="mt-2 text-xl text-gray-700">
          Olá, {perfil.nome}. Esta área será preenchida na Fase 3.
        </p>
      </div>

      {erro === "sem-permissao" ? (
        <p
          role="alert"
          className="rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-lg font-semibold text-amber-900"
        >
          Seu perfil não tem acesso a essa página.
        </p>
      ) : null}

      <section className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-8">
        <h2 className="text-2xl font-bold text-gray-900">Em construção</h2>
        <p className="mt-3 text-lg text-gray-700">
          Aqui vão aparecer as consultas de hoje, com status colorido e os
          botões para marcar presença ou falta.
        </p>
      </section>
    </div>
  );
}
