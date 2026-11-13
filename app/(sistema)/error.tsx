"use client";

import Link from "next/link";

export default function SistemaError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          Não foi possível carregar esta tela
        </h1>
        <p className="mt-2 text-xl text-gray-700">
          Ocorreu um erro inesperado. Tente novamente. Se o problema continuar,
          avise a administração.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-sky-900 px-6 py-4 text-xl font-bold text-white hover:bg-sky-800"
        >
          Tentar de novo
        </button>
        <Link
          href="/agenda"
          className="rounded-xl border-2 border-sky-900 px-6 py-4 text-xl font-semibold text-sky-900 hover:bg-sky-50"
        >
          Voltar para a agenda
        </Link>
      </div>
    </div>
  );
}
