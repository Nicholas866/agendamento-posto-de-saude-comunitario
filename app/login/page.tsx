import Link from "next/link";
import { redirect } from "next/navigation";

import { getPerfilAtual, rotaInicial } from "@/lib/auth";

import { entrar } from "./actions";

// A leitura de cookies não pode ser pré-renderizada; com Cache Components
// precisamos desativar a navegação instantânea neste segmento.
export const instant = false;

const MENSAGENS: Record<string, string> = {
  campos: "Preencha o e-mail e a senha.",
  credenciais: "E-mail ou senha incorretos. Tente novamente.",
  "sem-perfil":
    "Sua conta não tem perfil de acesso cadastrado. Procure o administrador do sistema.",
  "sem-permissao": "Seu perfil não tem acesso a essa página.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const perfil = await getPerfilAtual();

  if (perfil) {
    redirect(rotaInicial(perfil.papel));
  }

  const { erro } = await searchParams;
  const mensagem = erro ? MENSAGENS[erro] : undefined;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-12">
      <header className="mb-8 flex items-center gap-4">
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
        <h2 className="text-3xl font-bold text-gray-900">Entrar no sistema</h2>
        <p className="mt-2 text-lg text-gray-700">
          Use o e-mail e a senha fornecidos pela coordenação do posto.
        </p>

        {mensagem ? (
          <p
            role="alert"
            className="mt-6 rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-lg font-semibold text-red-900"
          >
            {mensagem}
          </p>
        ) : null}

        <form action={entrar} className="mt-6 space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-lg font-semibold text-gray-900"
            >
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-2 w-full rounded-xl border-2 border-gray-400 px-4 py-3 text-xl text-gray-900 focus:border-sky-800"
            />
          </div>

          <div>
            <label
              htmlFor="senha"
              className="block text-lg font-semibold text-gray-900"
            >
              Senha
            </label>
            <input
              id="senha"
              name="senha"
              type="password"
              autoComplete="current-password"
              required
              className="mt-2 w-full rounded-xl border-2 border-gray-400 px-4 py-3 text-xl text-gray-900 focus:border-sky-800"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-sky-900 px-6 py-4 text-xl font-bold text-white hover:bg-sky-800"
          >
            Entrar
          </button>
        </form>
      </section>

      <Link
        href="/"
        className="mt-8 text-center text-lg font-semibold text-sky-900 underline"
      >
        Voltar para a página inicial
      </Link>
    </main>
  );
}
