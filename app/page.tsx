import { isSupabaseConfigured } from "@/lib/supabase";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-900 text-2xl font-bold text-white"
        >
          UBS
        </span>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-800">
            Posto de Saúde Comunitário
          </p>
          <h1 className="text-4xl font-bold text-gray-900">Agenda UBS</h1>
        </div>
      </header>

      <section className="rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="text-3xl font-bold text-gray-900">
          Agendamento de consultas
        </h2>
        <p className="mt-4 text-xl text-gray-700">
          Sistema para organizar a agenda do posto, reduzir filas e avisar o
          paciente antes da consulta.
        </p>
      </section>

      <section
        aria-labelledby="status-conexao"
        className="rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-sm"
      >
        <h2 id="status-conexao" className="text-2xl font-bold text-gray-900">
          Conexão com o Supabase
        </h2>

        {isSupabaseConfigured ? (
          <p className="mt-4 inline-flex items-center gap-3 rounded-xl bg-green-100 px-4 py-3 text-xl font-semibold text-green-900">
            <span aria-hidden="true">✓</span>
            Configurado
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="inline-flex items-center gap-3 rounded-xl bg-amber-100 px-4 py-3 text-xl font-semibold text-amber-900">
              <span aria-hidden="true">!</span>
              Ainda não configurado
            </p>
            <p className="text-lg text-gray-700">
              Copie o arquivo <code className="font-mono">.env.example</code>{" "}
              para <code className="font-mono">.env.local</code> e preencha a URL
              e a chave pública do seu projeto Supabase. Depois reinicie o
              servidor.
            </p>
          </div>
        )}
      </section>

      <footer className="mt-auto pt-4 text-base text-gray-600">
        Projeto de extensão — Ciência da Computação.
      </footer>
    </main>
  );
}
