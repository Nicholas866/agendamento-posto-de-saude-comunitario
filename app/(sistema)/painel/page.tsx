import { exigirPapel } from "@/lib/auth";

export default async function PainelPage() {
  const perfil = await exigirPapel("recepcao", "admin");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Painel de faltas</h1>
        <p className="mt-2 text-xl text-gray-700">
          Olá, {perfil.nome}. Esta área será preenchida na Fase 5.
        </p>
      </div>

      <section className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-8">
        <h2 className="text-2xl font-bold text-gray-900">Em construção</h2>
        <p className="mt-3 text-lg text-gray-700">
          Aqui vão aparecer os totais por status, a taxa de faltas e o gráfico
          por semana e por profissional.
        </p>
      </section>
    </div>
  );
}
