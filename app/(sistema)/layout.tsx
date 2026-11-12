import Link from "next/link";

import { exigirPerfil, NOME_DO_PAPEL } from "@/lib/auth";

import { sair } from "./actions";

// A sessão é lida a cada requisição; com Cache Components desativamos a
// navegação instantânea neste segmento para não bloquear o build.
export const instant = false;

export default async function SistemaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const perfil = await exigirPerfil();
  const podeGerenciar =
    perfil.papel === "admin" || perfil.papel === "recepcao";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b-2 border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/agenda" className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-900 text-lg font-bold text-white"
            >
              UBS
            </span>
            <span className="text-2xl font-bold text-gray-900">Agenda UBS</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">
                {perfil.nome}
              </p>
              <p className="text-sm text-gray-600">
                {NOME_DO_PAPEL[perfil.papel]}
              </p>
            </div>
            <form action={sair}>
              <button
                type="submit"
                className="rounded-xl border-2 border-sky-900 px-4 py-2 text-lg font-semibold text-sky-900 hover:bg-sky-50"
              >
                Sair
              </button>
            </form>
          </div>
        </div>

        <nav
          aria-label="Menu principal"
          className="mx-auto flex w-full max-w-5xl flex-wrap gap-2 px-6 pb-3"
        >
          <Link
            href="/agenda"
            className="rounded-lg px-4 py-2 text-lg font-semibold text-sky-900 hover:bg-sky-50"
          >
            Agenda
          </Link>
          {podeGerenciar ? (
            <>
              <Link
                href="/consultas/nova"
                className="rounded-lg px-4 py-2 text-lg font-semibold text-sky-900 hover:bg-sky-50"
              >
                Nova consulta
              </Link>
              <Link
                href="/horarios"
                className="rounded-lg px-4 py-2 text-lg font-semibold text-sky-900 hover:bg-sky-50"
              >
                Horários
              </Link>
            </>
          ) : null}
          <Link
            href="/pacientes"
            className="rounded-lg px-4 py-2 text-lg font-semibold text-sky-900 hover:bg-sky-50"
          >
            Pacientes
          </Link>
          {perfil.papel === "admin" ? (
            <Link
              href="/profissionais"
              className="rounded-lg px-4 py-2 text-lg font-semibold text-sky-900 hover:bg-sky-50"
            >
              Profissionais
            </Link>
          ) : null}
          {podeGerenciar ? (
            <Link
              href="/painel"
              className="rounded-lg px-4 py-2 text-lg font-semibold text-sky-900 hover:bg-sky-50"
            >
              Painel
            </Link>
          ) : null}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {children}
      </main>
    </div>
  );
}
