import Link from "next/link";

import { Alerta } from "@/components/alerta";
import { exigirPerfil } from "@/lib/auth";
import { listarPacientes } from "@/lib/dados/pacientes";
import {
  formatarCpfOuCartao,
  formatarTelefone,
  NOME_DO_CANAL,
} from "@/lib/formatacao";

const MENSAGENS_SUCESSO: Record<string, string> = {
  criado: "Paciente cadastrado com sucesso.",
  editado: "Paciente atualizado com sucesso.",
};

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sucesso?: string }>;
}) {
  const perfil = await exigirPerfil();
  const { q, sucesso } = await searchParams;

  const termo = typeof q === "string" ? q : "";
  const pacientes = await listarPacientes(termo);
  const podeEditar = perfil.papel === "recepcao" || perfil.papel === "admin";
  const podeVerContato = podeEditar;
  const mensagem = sucesso ? MENSAGENS_SUCESSO[sucesso] : undefined;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Pacientes</h1>
          <p className="mt-2 text-xl text-gray-700">
            {podeVerContato
              ? "Busque por nome, CPF ou Cartão SUS."
              : "Busque pelo nome do paciente."}
          </p>
        </div>

        {podeEditar ? (
          <Link
            href="/pacientes/novo"
            className="rounded-xl bg-sky-900 px-6 py-4 text-xl font-bold text-white hover:bg-sky-800"
          >
            Novo paciente
          </Link>
        ) : null}
      </div>

      {mensagem ? <Alerta tipo="sucesso">{mensagem}</Alerta> : null}

      <form
        method="get"
        action="/pacientes"
        className="rounded-2xl border-2 border-gray-200 bg-white p-6"
      >
        <label htmlFor="q" className="block text-lg font-semibold text-gray-900">
          Buscar paciente
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={termo}
            placeholder={
              podeVerContato ? "Nome, CPF ou Cartão SUS" : "Nome do paciente"
            }
            className="w-full rounded-xl border-2 border-gray-400 bg-white px-4 py-3 text-xl text-gray-900 focus:border-sky-800"
          />
          <button
            type="submit"
            className="rounded-xl bg-sky-900 px-6 py-3 text-xl font-bold text-white hover:bg-sky-800"
          >
            Buscar
          </button>
          {termo ? (
            <Link
              href="/pacientes"
              className="rounded-xl border-2 border-gray-400 px-6 py-3 text-center text-xl font-semibold text-gray-900 hover:bg-gray-100"
            >
              Limpar
            </Link>
          ) : null}
        </div>
      </form>

      {pacientes.length === 0 ? (
        <Alerta tipo="aviso">
          {termo
            ? "Nenhum paciente encontrado para essa busca."
            : "Nenhum paciente cadastrado ainda."}
        </Alerta>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {pacientes.map((paciente) => (
            <li
              key={paciente.id}
              className="rounded-2xl border-2 border-gray-200 bg-white p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900">
                {paciente.nome}
              </h2>

              {podeVerContato ? (
                <dl className="mt-3 space-y-1 text-lg text-gray-800">
                  <div>
                    <dt className="inline font-semibold">CPF/Cartão SUS: </dt>
                    <dd className="inline">
                      {formatarCpfOuCartao(paciente.cpf_ou_cartao_sus)}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold">Telefone: </dt>
                    <dd className="inline">
                      {formatarTelefone(paciente.telefone)}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold">E-mail: </dt>
                    <dd className="inline">{paciente.email ?? "não informado"}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold">Aviso preferido: </dt>
                    <dd className="inline">
                      {NOME_DO_CANAL[paciente.canal_preferido] ??
                        paciente.canal_preferido}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-3 text-base text-gray-600">
                  Os dados de contato ficam visíveis apenas para a recepção e a
                  administração.
                </p>
              )}

              {podeEditar ? (
                <Link
                  href={`/pacientes/${paciente.id}/editar`}
                  className="mt-4 inline-block rounded-xl border-2 border-sky-900 px-5 py-3 text-lg font-semibold text-sky-900 hover:bg-sky-50"
                >
                  Editar
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {pacientes.length === 50 ? (
        <p className="text-base text-gray-600">
          Mostrando os 50 primeiros resultados. Refine a busca para ver outros
          pacientes.
        </p>
      ) : null}
    </div>
  );
}
