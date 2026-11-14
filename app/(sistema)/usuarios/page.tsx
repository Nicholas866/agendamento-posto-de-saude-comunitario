import { Alerta } from "@/components/alerta";
import { FormularioUsuario } from "@/components/formulario-usuario";
import { exigirPapel, NOME_DO_PAPEL } from "@/lib/auth";
import { listarUsuarios, type UsuarioSistema } from "@/lib/dados/usuarios";

import { criarUsuario } from "./actions";

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ sucesso?: string }>;
}) {
  await exigirPapel("admin");
  const { sucesso } = await searchParams;

  let usuarios: UsuarioSistema[] = [];
  let erro = "";

  try {
    usuarios = await listarUsuarios();
  } catch {
    erro =
      "Não foi possível carregar os usuários. Confira se a variável SUPABASE_SERVICE_ROLE_KEY está configurada no servidor.";
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Usuários</h1>
        <p className="mt-2 text-xl text-gray-700">
          Crie contas de acesso para a equipe do posto. Esta área é exclusiva
          do administrador.
        </p>
      </div>

      {sucesso === "criado" ? (
        <Alerta tipo="sucesso">
          Usuário criado com sucesso. A conta já pode entrar no sistema.
        </Alerta>
      ) : null}

      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}

      <section className="rounded-2xl border-2 border-gray-200 bg-white p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-900">Novo usuário</h2>
        <p className="mt-2 text-lg text-gray-700">
          A conta é criada com o e-mail já confirmado. A senha é definida agora
          e não pode ser consultada depois.
        </p>

        <div className="mt-6">
          <FormularioUsuario acao={criarUsuario} />
        </div>
      </section>

      <section className="rounded-2xl border-2 border-gray-200 bg-white p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Usuários cadastrados
        </h2>

        {usuarios.length === 0 ? (
          <div className="mt-4">
            <Alerta tipo="aviso">
              {erro
                ? "A lista não pôde ser carregada."
                : "Nenhum usuário cadastrado ainda."}
            </Alerta>
          </div>
        ) : (
          <ul className="mt-4 divide-y-2 divide-gray-100">
            {usuarios.map((usuario) => (
              <li
                key={usuario.id}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xl font-bold text-gray-900">
                    {usuario.nome}
                  </p>
                  <p className="text-lg text-gray-700">
                    {usuario.email || "E-mail não encontrado"}
                  </p>
                </div>
                <p className="inline-block rounded-lg border-2 border-sky-300 bg-sky-100 px-3 py-1 text-base font-bold text-sky-900">
                  {NOME_DO_PAPEL[usuario.papel] ?? usuario.papel}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
