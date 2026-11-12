import Link from "next/link";

import { Alerta } from "@/components/alerta";
import { exigirPapel } from "@/lib/auth";
import { listarProfissionais } from "@/lib/dados/profissionais";

import { alternarAtivo } from "./actions";

const MENSAGENS_SUCESSO: Record<string, string> = {
  criado: "Profissional cadastrado com sucesso.",
  editado: "Profissional atualizado com sucesso.",
  ativado: "Profissional ativado. Ele volta a aparecer para novos horários.",
  desativado:
    "Profissional desativado. As consultas já marcadas continuam valendo.",
};

const MENSAGENS_ERRO: Record<string, string> = {
  invalido: "Profissional inválido.",
  salvar: "Não foi possível alterar a situação. Tente novamente.",
};

export default async function ProfissionaisPage({
  searchParams,
}: {
  searchParams: Promise<{ sucesso?: string; erro?: string }>;
}) {
  await exigirPapel("admin");

  const { sucesso, erro } = await searchParams;
  const profissionais = await listarProfissionais();
  const mensagemSucesso = sucesso ? MENSAGENS_SUCESSO[sucesso] : undefined;
  const mensagemErro = erro ? MENSAGENS_ERRO[erro] : undefined;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Profissionais</h1>
          <p className="mt-2 text-xl text-gray-700">
            Desativar não apaga o cadastro nem cancela consultas já marcadas.
          </p>
        </div>

        <Link
          href="/profissionais/novo"
          className="rounded-xl bg-sky-900 px-6 py-4 text-xl font-bold text-white hover:bg-sky-800"
        >
          Novo profissional
        </Link>
      </div>

      {mensagemSucesso ? <Alerta tipo="sucesso">{mensagemSucesso}</Alerta> : null}
      {mensagemErro ? <Alerta tipo="erro">{mensagemErro}</Alerta> : null}

      {profissionais.length === 0 ? (
        <Alerta tipo="aviso">Nenhum profissional cadastrado ainda.</Alerta>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {profissionais.map((profissional) => (
            <li
              key={profissional.id}
              className="rounded-2xl border-2 border-gray-200 bg-white p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profissional.nome}
                  </h2>
                  <p className="mt-1 text-lg text-gray-700">
                    {profissional.especialidade}
                  </p>
                </div>
                <span
                  className={`rounded-lg px-3 py-1 text-base font-bold ${
                    profissional.ativo
                      ? "bg-green-100 text-green-900"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {profissional.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/profissionais/${profissional.id}/editar`}
                  className="rounded-xl border-2 border-sky-900 px-5 py-3 text-lg font-semibold text-sky-900 hover:bg-sky-50"
                >
                  Editar
                </Link>

                <form action={alternarAtivo}>
                  <input type="hidden" name="id" value={profissional.id} />
                  <input
                    type="hidden"
                    name="ativo"
                    value={profissional.ativo ? "false" : "true"}
                  />
                  <button
                    type="submit"
                    className="rounded-xl border-2 border-gray-500 px-5 py-3 text-lg font-semibold text-gray-900 hover:bg-gray-100"
                  >
                    {profissional.ativo ? "Desativar" : "Ativar"}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
