import Link from "next/link";

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
          Sistema para organizar a agenda do posto, reduzir filas e acompanhar
          as faltas dos pacientes.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl bg-sky-900 px-6 py-4 text-xl font-bold text-white hover:bg-sky-800"
        >
          Entrar no sistema
        </Link>
      </section>

      <footer className="mt-auto pt-4 text-base text-gray-600">
        Projeto de extensão — Ciência da Computação.
      </footer>
    </main>
  );
}
